import {useReactiveVar} from '@apollo/client';
import {useQuery} from '@tanstack/react-query';

import {favoriteDaosVar, NavigationDao} from 'context/apolloClient';
import {getFavoritedDaosFromCache} from 'services/cache';
import {resolveDaoAvatarIpfsCid} from 'utils/library';

/**
 * This hook returns a list of cached daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 * @param skip number of DAOs to skip before fetching
 * @param limit number of DAOs to return per fetch (page size)
 * @returns A list of daos and their respective infos (metadata, plugins, etc.)
 */
export const useCachedDaosQuery = (skip = 0, limit = -1) => {
  const cachedDaos = useReactiveVar(favoriteDaosVar);

  return useQuery({
    queryKey: ['cachedDaos'],
    queryFn: () => getFavoritedDaosFromCache(cachedDaos, {skip, limit}),
    select: addAvatarToDao,
  });
};

function addAvatarToDao(daos: NavigationDao[]) {
  return daos.map(dao => {
    dao.metadata.avatar = resolveDaoAvatarIpfsCid(dao.metadata.avatar);
    return dao;
  });
}
