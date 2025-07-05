import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    display: flex;
    place-items: center;
    width: 100vw;
    min-width: 320px;
    min-height: 100vh;
    background: linear-gradient(to right, #000000, #1a1a1a, #000000);
    backgroundColor: #181818;
    color: rgb(190, 237, 245);
    overflow-x: hidden;
     align-items: center;
  }
  #root{
    display: flex;
    justify-content: center;
    width: 100%;
    margin: 0 auto;
    text-align: center;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

::-webkit-scrollbar {
  width: 10px;
  
}

/* Track */
::-webkit-scrollbar-track {
  background: #2b303582!important;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: #186fef; 
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #4089f5; 
}
`;
