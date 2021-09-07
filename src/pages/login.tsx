import React from 'react';
import{Formik,Form} from 'formik'
import { Button, Flex, FormControl, Link, Spinner, useToast } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { LoginInput, MeDocument, useLoginMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import useCheckAuth from '../utils/useCheckAuth';
import NextLink from 'next/link'
import { initializeApollo } from '../lib/apolloClient';
function Login() {
    const {data:dataCheckAuth,loading:loadingCheckAuth}=useCheckAuth();
 
    const router = useRouter()
    const initial:LoginInput={usernameOrEmail:'',password:""}
    const[loginUser,{data,error}]=useLoginMutation();
    const tost=useToast();
    const onLoginSubmit=async(values:LoginInput)=>{

     const response= await loginUser({
            variables:{
                loginInput:values
            },
            update(cache,{data}){
                console.log(data);
                // const meData=cache.readQuery({query:MeDocument})
                // console.log(meData)
                if(data?.login.success){
                    cache.writeQuery({query:MeDocument,data:{me:data.login.user}})
                }
            }
        })

        if(response.data?.login.success)
        {
            tost({
                title:"welcome",
                description:`${response.data.login.user?.username}`,
                status:"success",
                duration:1000,
                isClosable:true
            })
            // const apolloClient =initializeApollo();
            // apolloClient.resetStore()
            router.push('/')
        }
    }

    

    return (<>
        {loadingCheckAuth||(!loadingCheckAuth&&dataCheckAuth?.me)?
            <Flex justifyContent='center' alignItems='center'>
                <Spinner/>
            </Flex> 
            :(
                <Wrapper size="small">
                    {error&& <p>login fail</p>}
                    {data!==undefined&&data?.login&&<p>{data.login.message}</p>}
                    <Formik initialValues={initial} onSubmit={(values)=>onLoginSubmit(values)}>
                        {
                        ()=>(
                            <Form>
                                <FormControl>
                                    <InputField 
                                            name="usernameOrEmail"
                                            placeholder="username or email" 
                                            label="username or email"
                                            type="text"
                                            />
                                    <InputField 
                                            name="password"
                                            placeholder="password" 
                                            type="password"
                                            label="password"
                                            />
                                    <Flex mt={2}>
                                        <NextLink href='/forgotpassword'>
                                            <Link>Forgot Password?</Link>
                                        </NextLink>
                                    </Flex>

                                    <Button type="submit"
                                            colorScheme="teal"
                                            mt={4}
                                            >
                                            Login
                                    </Button>
                                </FormControl>
                            </Form>
                            )
                        }
                    </Formik>
                </Wrapper>  
            )
        }
        </>
    );
}

export default Login;