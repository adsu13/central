import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 40px 10px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  min-width: 320px;

  textarea {
    margin-bottom: 15px;
    height: 100px;
    max-height: 400px;
  }

  .accordion-button:not(.collapsed) {
    background-color: #2b303582;
  }

  .input-group,
  form {
    width: 100%;
  }

  b {
    margin: 4px;
  }

  input {
    background-color: #2b303582;
  }

  .form-floating textarea {
    height: 100px;
    max-height: 400px;
    background-color: #2b303582;
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

  svg {
    margin: 5px;
  }

  img {
    width: 200px;
  }

  nav {
    display: flex;
    margin-bottom: 5px;
  }

  .dropdown-menu {
    background: #2b303582;
  }

  .dropdown-item:active {
    background-color: #186fef91;
  }

  .input-group-text {
    background-color: #2b303582;
  }

  .form-control:focus {
    background-color: #2b303582;
  }

  .dropdown-menu.show {
    width: 100%;
  }
  #input-group-dropdown-1 {
    font-weight: bold;
  }
  .btn:focus,
  .btn:hover {
    background: #6c757d7a;
  }

  button {
    height: 38px;
  }

  .container img {
    width: 400px;
    padding: 10px;
  }

  .mw1 {
    max-width: 50%;
  }
  .form-control {
    white-space: pre-wrap;
  }

  .accordion {
    width: 100%;
    --bs-accordion-bg: transparent;
  }
  textarea,
  .accordion-body {
    background-color: #2b303582 !important;
  }
  .approved {
    background-color: #2b303582;
  }
  .rejected {
    background-color: #2b303582;
  }
`;

export const Welcome = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  font-size: 20px;
  font-weight: bold;

  margin-bottom: 5px;

  > div {
    display: flex;
    align-items: center;
    text-align: left;
    width: 100%;
  }

  @media only screen and (max-width: 600px) {
    display: flex;
    flex: 1;
    align-items: center;
    font-size: 15px;

    img {
      width: 20%;
    }
  }
`;

export const RawCC = styled.div`
  text-align: left;
  outline: none;
  font-size: 14px;
  font-weight: bold;
  max-height: 200px;
  overflow: auto;

  .red{
    color: #CD5C5C;
  }

  .green {
    color: #3CB371;
    text-align: left;
    margin-bottom: 10px;
    border-radius: 3px;
  }
`;
