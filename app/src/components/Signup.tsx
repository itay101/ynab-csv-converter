import { Input } from '@chakra-ui/react';
import React from 'react';

function Signup() {
  return (
    <form method='post' action='/signup'>
        <Input type="email" name="email" placeholder='Username'/>
        <Input name="password" placeholder='Password' type="password"/>
        <Input type="submit" value="Create Account"/>
    </form>
  );
}

export default Signup;
