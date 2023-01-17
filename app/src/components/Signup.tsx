import {Input} from '@chakra-ui/react';
import React, {useState} from 'react';
import axios from "axios";

function Signup() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function signupUser(event: any) {
        event.preventDefault()
        axios.post('http://localhost:8000/signup', {
            'email': username,
            'password': password
        })
    }

    return (
        <form onSubmit={signupUser}>
            <Input type="email" placeholder='Username' value={username} onChange={e => setUsername(e.target.value)}/>
            <Input name="password" placeholder='Password' type="password" value={password}
                   onChange={e => setPassword(e.target.value)}/>
            <Input type="submit" value="Create Account"/>
        </form>
    );
}

export default Signup;
