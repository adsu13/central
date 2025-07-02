import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  img {
    width: 300px;
    margin-bottom: 10px;
  }
  form {
    width: 40%;
    min-width: 300px;
    max-width: 400px;
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
