import React from 'react';
import { useField } from 'formik'
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
 interface InputFieldProps {
	name: string
	label: string
	placeholder: string
	type: string
    textarea?:boolean
}


function InputField({textarea,...props}:InputFieldProps) {
    const [field, { error }] = useField(props);
    
        
    
    return (
        <FormControl isInvalid={!!error}>
        
            <FormLabel htmlFor={field.name}>
                {props.label}
            </FormLabel>
            {textarea?<Textarea  id={field.name} {...props} {...field} />:<Input  id={field.name} {...props} {...field} />}
            
            {error&&<FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
}

export default InputField;