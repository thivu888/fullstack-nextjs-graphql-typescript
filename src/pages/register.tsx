import React from 'react';
import{Formik,Form} from 'formik'
import { Button, FormControl, Flex,Spinner, useToast } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { MeDocument, RegisterInput, useRegisterMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import useCheckAuth from '../utils/useCheckAuth';
function Register() {
    const {data:dataCheckAuth,loading:loadingCheckAuth}=useCheckAuth();

    const router = useRouter()

    const initial:RegisterInput={username:'',email:"",password:""}

    const[registerUser,{data,error}]=useRegisterMutation();

    const tost=useToast();
    const onRegisterSubmit=async(values:RegisterInput)=>{

     const response= await registerUser({
            variables:{
                registerInput:values
            },
            update(cache,{data}){
                // const meData=cache.readQuery({query:MeDocument})
                // console.log(meData)
                if(data?.register.success){
                    cache.writeQuery({query:MeDocument,data:{me:data.register.user}})
                }
            }
        })

        if(response.data?.register.success)
        {
            tost({
                title:"welcome",
                description:`${response.data.register.user?.username}`,
                status:"success",
                duration:1000,
                isClosable:true
            })
            router.push('/')
        }
    }

    console.log(data)
    return (<>
        {loadingCheckAuth||(!loadingCheckAuth&&dataCheckAuth?.me)?
            <Flex justifyContent='center' alignItems='center'>
                <Spinner/>
            </Flex> 
            :(
        <Wrapper size="small">
            {error&& <p>fail register</p>}
            {data!==undefined&&data?.register&&<p>{data.register.message}</p>}
            <Formik initialValues={initial} onSubmit={(values)=>onRegisterSubmit(values)}>
                {
                ()=>(
                    <Form>
                        <FormControl>
                            <InputField 
                                    name="username"
                                    placeholder="username" 
                                    label="username"
                                    type="text"
                                    />
                             <InputField 
                                    name="email"
                                    placeholder="email" 
                                    label="email"
                                    type="email"
                                    />
                            <InputField 
                                    name="password"
                                    placeholder="password" 
                                    type="password"
                                    label="password"
                                    />
                            <Button type="submit"
                                    colorScheme="teal"
                                    mt={4}
                                    >
                                    Register
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

export default Register;