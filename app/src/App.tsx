import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from './components/Signup';
import Layout from './components/Layout';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
    </BrowserRouter>
  </ChakraProvider>
  );
}

export default App;
