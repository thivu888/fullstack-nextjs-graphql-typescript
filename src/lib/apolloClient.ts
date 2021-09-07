import { useMemo } from 'react'
import { ApolloCache, ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { concatPagination } from '@apollo/client/utilities'
import fetch from 'isomorphic-unfetch'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { Post } from '../generated/graphql'
import { IncomingHttpHeaders } from 'http'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient :ApolloClient<NormalizedCacheObject>;

interface IAppoloStateProps{
  [APOLLO_STATE_PROP_NAME]?:NormalizedCacheObject 
}

function createApolloClient(headers:IncomingHttpHeaders|null=null) {
  const enhancedFetch = (url: RequestInfo, init: RequestInit) => {
    return fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        'Access-Control-Allow-Origin': '*',
        // here we pass the cookie along for each request
        Cookie: headers?.cookie ?? '',
      },
    })
  }

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: 'http://localhost:4000/graphql', // Server URL (must be absolute)
      credentials: 'include', // Additional fetch() options like `credentials` or `headers`
      fetch:enhancedFetch
    }),
    cache: new InMemoryCache({
      typePolicies:{
        Query:{
          fields:{
            posts:{
              keyArgs:false,
              merge(existing,incoming){
                let paginatedPosts: Post[] = []
                console.log('existing',existing);
                console.log('incoming',incoming.paginatedPosts);
                
								if (existing && existing.paginatedPosts) {
                  console.log('existing khong null')
									paginatedPosts = paginatedPosts.concat(
										existing.paginatedPosts
									)
								}

								if (incoming && incoming.paginatedPosts) {
									paginatedPosts = paginatedPosts.concat(
										incoming.paginatedPosts
									)
								}

								return { ...incoming, paginatedPosts }
              }
            }
          }
        }
      }
    }),
  })
}

type InitialState = NormalizedCacheObject | undefined
interface IInitializeApollo {
  headers?: IncomingHttpHeaders | null
  initialState?: InitialState | null
}

export function initializeApollo({ headers, initialState }: IInitializeApollo = {
  headers: null,
  initialState: null,
}) {
  const _apolloClient = apolloClient ?? createApolloClient(headers)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function addApolloState(client:ApolloClient<NormalizedCacheObject>, pageProps:{props:IAppoloStateProps}) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps:IAppoloStateProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo({initialState:state}), [state])
  return store
}