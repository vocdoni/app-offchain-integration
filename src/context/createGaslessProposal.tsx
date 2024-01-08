import {
  CreateMajorityVotingProposalParams,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';
import {ProposalMetadata} from '@aragon/sdk-client-common';
import {useCallback, useState} from 'react';

import {
  Census,
  Census3Census,
  Election,
  Token as Census3Token,
  IElectionParameters,
  TokenCensus,
  UnpublishedElection,
  AccountData,
  ErrAPI,
} from '@vocdoni/sdk';
import {VoteValues} from '@aragon/sdk-client';
import {useClient} from '@vocdoni/react-providers';
import {
  StepsMap,
  StepStatus,
  useFunctionStepper,
} from '../hooks/useFunctionStepper';
import {useCensus3Client, useCensus3CreateToken} from '../hooks/useCensus3';

export enum GaslessProposalStepId {
  REGISTER_VOCDONI_ACCOUNT = 'REGISTER_VOCDONI_ACCOUNT',
  CREATE_VOCDONI_ELECTION = 'CREATE_VOCDONI_ELECTION',
  CREATE_ONCHAIN_PROPOSAL = 'CREATE_ONCHAIN_PROPOSAL',
  PROPOSAL_IS_READY = 'PROPOSAL_IS_READY',
}

export type GaslessProposalSteps = StepsMap<GaslessProposalStepId>;

type ICreateGaslessProposal = {
  daoToken: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
  chainId: number;
};

export type UseCreateElectionProps = Omit<
  IElectionParameters,
  | 'header'
  | 'streamUri'
  | 'voteType'
  | 'electionType'
  | 'questions'
  | 'maxCensusSize'
  | 'addSDKVersion'
> & {
  question: string;
};

interface IProposalToElectionProps {
  metadata: ProposalMetadata;
  data: CreateMajorityVotingProposalParams;
  census: Census;
}

const proposalToElection = ({
  metadata,
  data,
  census,
}: IProposalToElectionProps): UseCreateElectionProps => {
  return {
    title: metadata.title,
    description: metadata.description,
    question: metadata.summary,
    startDate: data.startDate,
    endDate: data.endDate!,
    meta: data, // Store all DAO metadata to retrieve it easily
    census: census,
  };
};

const useCreateGaslessProposal = ({
  daoToken,
  chainId,
}: ICreateGaslessProposal) => {
  const {steps, updateStepStatus, doStep, globalState, resetStates} =
    useFunctionStepper({
      initialSteps: {
        REGISTER_VOCDONI_ACCOUNT: {
          status: StepStatus.WAITING,
        },
        CREATE_VOCDONI_ELECTION: {
          status: StepStatus.WAITING,
        },
        CREATE_ONCHAIN_PROPOSAL: {
          status: StepStatus.WAITING,
        },
        PROPOSAL_IS_READY: {
          status: StepStatus.WAITING,
        },
      } as GaslessProposalSteps,
    });

  const {client: vocdoniClient} = useClient();
  const census3 = useCensus3Client();
  const {createToken} = useCensus3CreateToken({chainId});
  const [account, setAccount] = useState<AccountData | undefined>(undefined);

  // todo(kon): check if this is needed somewhere else
  const collectFaucet = useCallback(
    async (cost: number) => {
      let balance = (await vocdoniClient.fetchAccountInfo()).balance;
      while (cost > balance) {
        balance = (await vocdoniClient.collectFaucetTokens()).balance;
      }
    },
    [vocdoniClient]
  );

  const createVocdoniElection = useCallback(
    async (electionData: UseCreateElectionProps) => {
      const election: UnpublishedElection = Election.from({
        title: electionData.title,
        description: electionData.description,
        endDate: electionData.endDate,
        startDate: electionData.startDate,
        census: electionData.census,
        maxCensusSize: electionData.census.size ?? undefined,
        electionType: {interruptible: false},
      });
      election.addQuestion(
        electionData.question,
        '',
        // Map choices from Aragon enum.
        // This is important to respect the order and the values
        Object.keys(VoteValues)
          .filter(key => isNaN(Number(key)))
          .map((key, i) => ({
            title: key,
            value: i,
          }))
      );

      const cost = await vocdoniClient.calculateElectionCost(election);

      await collectFaucet(cost);

      return await vocdoniClient.createElection(election);
    },
    [collectFaucet, vocdoniClient]
  );

  // todo(kon): this is not a callback
  const checkAccountCreation = useCallback(async () => {
    // Check if the account is already created, if not, create it
    let info;
    if (account) return;
    try {
      info = await vocdoniClient.createAccount();
    } catch (error) {
      console.log(error);
      throw Error('Error creating Vocdoni account');
    } finally {
      setAccount(info);
    }
  }, [account, vocdoniClient]);

  const createCensus = useCallback(async (): Promise<TokenCensus> => {
    async function getCensus3Token(): Promise<Census3Token> {
      let attempts = 0;
      const maxAttempts = 6;

      while (attempts < maxAttempts) {
        try {
          const censusToken = await census3.getToken(
            daoToken!.address,
            chainId
          );
          if (censusToken.status.synced) {
            return censusToken; // early exit if the object has sync set to true
          }
        } catch (e) {
          if (
            e instanceof ErrAPI &&
            e.message &&
            e.message.includes('no rows in result set')
          ) {
            await createToken(daoToken!.address);
          }
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
      throw Error('Census token is not already calculated, try again later');
    }

    const censusToken = await getCensus3Token();

    // Create the vocdoni census
    const census3census: Census3Census = await census3.createCensus(
      censusToken.defaultStrategy
    );

    return new TokenCensus(
      census3census.merkleRoot,
      census3census.uri,
      census3census.anonymous,
      censusToken,
      census3census.size,
      BigInt(census3census.weight)
    );
    // return await census3.createTokenCensus(censusToken.id);
  }, [census3, chainId, daoToken]);

  const createProposal = useCallback(
    async (
      metadata: ProposalMetadata,
      data: CreateMajorityVotingProposalParams,
      handleOnchainProposal: (
        electionId?: string,
        vochainCensus?: TokenCensus
      ) => Promise<Error | undefined>
    ) => {
      if (globalState === StepStatus.ERROR) {
        // If global status is error, reset the stepper states
        resetStates();
      } else if (globalState === StepStatus.SUCCESS) {
        return await handleOnchainProposal();
      }

      if (!daoToken) {
        return new Error('ERC20 SDK client is not initialized correctly');
      }

      // 1. Create an account if not exists
      await doStep(
        GaslessProposalStepId.REGISTER_VOCDONI_ACCOUNT,
        checkAccountCreation
      );
      // 2. Create vocdoni election
      let census: TokenCensus;
      const electionId = await doStep(
        GaslessProposalStepId.CREATE_VOCDONI_ELECTION,
        async () => {
          // 2.1 Register gasless proposal
          // This involves various steps such the census creation and election creation
          census = await createCensus();
          // 2.2. Create vocdoni election
          return await createVocdoniElection(
            proposalToElection({metadata, data, census})
          );
        }
      );

      // 3. Register the proposal onchain
      await doStep(
        GaslessProposalStepId.CREATE_ONCHAIN_PROPOSAL,
        async () => await handleOnchainProposal(electionId, census)
      );

      // 4. All ready
      updateStepStatus(
        GaslessProposalStepId.PROPOSAL_IS_READY,
        StepStatus.SUCCESS
      );
    },
    [
      globalState,
      daoToken,
      doStep,
      checkAccountCreation,
      updateStepStatus,
      resetStates,
      createCensus,
      createVocdoniElection,
    ]
  );

  return {steps, globalState, createProposal};
};

export {useCreateGaslessProposal};
