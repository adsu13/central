import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  img {
    width: 650px;
    height: auto; 
    margin-bottom: 10px;
  }
  form {
    width: 40%;
    min-width: 300px;
    max-width: 400px;
    flex-grow: 1;        /* Ocupa espaço restante */

  }
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b303582;
    border-color: #4d5756;
    &:hover {
      background-color: #2b3035c4;
      border-color: #4d5756;
    }
  }
  .form-control,
  .input-group-text {
    background-color: #2b303582;
  }
  .form-control:disabled {
    background-color: #2b303582;
  }
`;
