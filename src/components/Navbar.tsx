import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { MeDocument, useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Reference,gql } from '@apollo/client';

export const Navbar = () => {
    const  {data,loading}=useMeQuery();
    const [logoutUser]=useLogoutMutation();
    const logout=async()=>{
        await logoutUser({
            update(cache,{data}){
                if(data?.logout){
                    cache.writeQuery({query:MeDocument,data:{me:null}})
                }

                cache.modify({
                    fields:{
                        posts(existing){
                            existing.paginatedPosts.forEach((post:Reference)=>{
                                cache.writeFragment({
                                    id: post.__ref,
                                    fragment: gql`
                                    fragment VoteType on Post{
                                        voteType
                                    }
                                    `,
                                    data:{voteType:0}
                                })
                            })
                            return existing
                        }
                    }

                })
            }
        });
    }

    let body;

    if(loading) body=null;
    else if(!data?.me){
        body=(
            <>
                <NextLink href='/login'>
                    <Link mr={2} >Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link >Register</Link>
                </NextLink>
            </>
        )
    }else{
        body=(
            <Flex>
                <NextLink href='/create-post'>
                    <Button mr={4}>
                        Create Post
                    </Button>
                </NextLink>
                <Button onClick={logout}>Logout</Button>
            </Flex>
        )
    }
   
    return (
        <Box bg="tan" p={4}>
            <Flex maxW={800} justifyContent='space-between' alignItems='center' m='auto'>
                 <Heading>Reddit</Heading>
                 <Box>
                     {body}
                 </Box>
            </Flex>
        </Box>
    )
}
