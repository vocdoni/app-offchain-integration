import {useReactiveVar} from '@apollo/client';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

import {favoriteDaosVar, NavigationDao} from 'context/apolloClient';
import {getFavoritedDaosFromCache} from 'services/cache';
import {resolveDaoAvatarIpfsCid} from 'utils/library';

/**
 * This hook retrieves a list of cached DAOs with optional pagination.
 * @param skip The number of DAOs to skip before starting to fetch the result set.
 * (defaults to 0)
 * @param limit The maximum number of DAOs to return. Fetches all available DAOs by default.
 * @returns result object containing an array of NavigationDao objects with added avatar information.
 */
export const useCachedDaosQuery = (
  skip = 0,
  limit = -1
): UseQueryResult<NavigationDao[]> => {
  const cachedDaos = useReactiveVar(favoriteDaosVar);

  return useQuery<NavigationDao[]>({
    queryKey: ['cachedDaos'],
    queryFn: () => getFavoritedDaosFromCache(cachedDaos, {skip, limit}),
    select: addAvatarToDao,
  });
};

function addAvatarToDao(daos: NavigationDao[]): NavigationDao[] {
  return daos.map(({metadata, ...dao}) => {
    const avatar = resolveDaoAvatarIpfsCid(metadata.avatar);
    return {...dao, metadata, avatar};
  });
}
