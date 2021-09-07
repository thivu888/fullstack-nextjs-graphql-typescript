import { Box, Flex, Heading, Spinner, Stack,Link,Text, Button } from "@chakra-ui/react";
import Layout from "../components/Layout";
import { addApolloState, initializeApollo } from "../lib/apolloClient"
import NextLink from 'next/link'
import { PostEditDeleteButton } from "../components/PostEditDeleteButton";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { NetworkStatus } from "@apollo/client";
import UpvoteSection from '../components/UpvoteSection'
import { GetServerSidePropsContext } from "next";
export const limit=4;
const Index = () => {
 
  const {data,loading,fetchMore,networkStatus}=usePostsQuery({
    variables:{limit},
    notifyOnNetworkStatusChange:true,

  });

  const loadMore=async()=>fetchMore({
    variables:{
      limit,
      cursor:data?.posts?.cursor
    }
  })

  return(<>
    <Layout>
        {
          loading&&(networkStatus!==NetworkStatus.fetchMore)?(
            <Flex justifyContent='center' alignItems='center' minH='100vh'>
              <Spinner/>
            </Flex>
          ):(
            <Stack spacing={8}>
                {
                  data?.posts?.paginatedPosts.map(post=>(
                    <Flex key={post.id} shadow='md' borderWidth='1px'>
                      <UpvoteSection post={post} />
                      <Box m={4}>
                        <NextLink href={`/post/${post.id}`}>
                          <Link>
                            <Heading fontSize='xl'>{post.title}</Heading>
                          </Link>
                        </NextLink>
                        <Text>post by {post.user.username}</Text>
                        <Flex align='center'>
                          <Text mt={4} mr={4}>{post.textSnippet}</Text>
                          <PostEditDeleteButton
                          postId={post.id}
                          postUserId={post.user.id.toString()}
                          />
                        </Flex>
                      </Box>
                    </Flex>
                  ))
                }
            </Stack>
          )
        }
        {
          data?.posts?.hasMore&&(
            <Flex>
              <Button m='auto' my={8} 
                      isLoading={networkStatus==NetworkStatus.fetchMore} 
                      onClick={loadMore} 
              >
                  {networkStatus==NetworkStatus.fetchMore?'Loading...':'Show more'}
              </Button>
            </Flex>
          )
        }
    </Layout>
      
      </>
  )

}

export async function getServerSideProps(context:GetServerSidePropsContext) {
  const apolloClient = initializeApollo({headers:context.req.headers})

  await apolloClient.query({
    query:PostsDocument,
    variables:{
      limit:4
    }
  })

  return addApolloState(apolloClient, {
    props:{},
  })
}

export default Index
