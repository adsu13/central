import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    display: flex;
    place-items: center;
    width: 100vw;
    min-width: 320px;
    min-height: 100vh;
    background-image: url("./bg.png");
    background-repeat: no-repeat;
    background-size: cover;
    color: rgb(190, 237, 245);
    overflow-x: hidden;
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
