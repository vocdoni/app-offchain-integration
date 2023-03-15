import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {useReactiveVar} from '@apollo/client';
import {DaoCard} from 'components/daoCard';
import {favoriteDaosVar} from 'context/apolloClient';
import {ExploreFilter, EXPLORE_FILTER, useDaosQuery} from 'hooks/useDaosQuery';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {getSupportedNetworkByChainId, SupportedChainID} from 'utils/constants';
import {Dashboard} from 'utils/paths';

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isConnected} = useWallet();

  const favoritedDaos = useReactiveVar(favoriteDaosVar);
  const loggedInAndHasFavoritedDaos = isConnected && favoritedDaos.length > 0;

  const [filterValue, setFilterValue] = useState<ExploreFilter>(() =>
    loggedInAndHasFavoritedDaos ? 'favorite' : 'newest'
  );

  const {
    data: infiniteDaos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useDaosQuery(filterValue);

  useEffect(() => {
    if (!isConnected && filterValue !== 'newest') {
      setFilterValue('newest');
    }
  }, [filterValue, isConnected]);

  const handleFilterChange = (filterValue: string) => {
    if (isExploreFilter(filterValue)) {
      setFilterValue(filterValue);
    } else throw Error(`${filterValue} is not an acceptable filter value`);
  };

  const handleDaoClicked = (dao: string, chain: SupportedChainID) => {
    navigate(
      generatePath(Dashboard, {
        network: getSupportedNetworkByChainId(chain),
        dao,
      })
    );
  };

  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
          {loggedInAndHasFavoritedDaos && (
            <ButtonGroupContainer>
              <ButtonGroup
                defaultValue={filterValue}
                onChange={handleFilterChange}
                bgWhite={false}
              >
                <Option label={t('explore.explorer.myDaos')} value="favorite" />

                {/* <Option label={t('explore.explorer.popular')} value="popular" /> */}
                <Option label={t('explore.explorer.newest')} value="newest" />
              </ButtonGroup>
            </ButtonGroupContainer>
          )}
        </HeaderWrapper>
        <CardsWrapper>
          {isLoading ? (
            <Spinner size="default" />
          ) : (
            infiniteDaos?.pages?.map(dao => (
              <DaoCard
                key={dao.address}
                name={dao.metadata.name}
                ensName={dao.ensDomain}
                logo={dao.metadata.avatar}
                description={dao.metadata.description}
                chainId={dao.chain}
                onClick={() => handleDaoClicked(dao.address, dao.chain)}
                daoType={
                  (dao?.plugins?.[0]?.id as PluginTypes) ===
                  'token-voting.plugin.dao.eth'
                    ? 'token-based'
                    : 'wallet-based'
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {hasNextPage && (
        <div>
          <ButtonText
            label={t('explore.explorer.showMore')}
            iconRight={
              isFetchingNextPage ? <Spinner size="xs" /> : <IconChevronDown />
            }
            bgWhite
            mode="ghost"
            onClick={() => fetchNextPage()}
          />
        </div>
      )}
    </Container>
  );
};

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;
