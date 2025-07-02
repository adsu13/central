import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";

import { Container } from "./styles";
function List({ list }) {
 

  useEffect(() => {
    list.map((item) => {
      item.includes("Aprovado")
        ? setApproved((oldArray) => [...oldArray, item])
        : setRejected((oldArray) => [...oldArray, item]);
    });
  }, []);

  return (
    <Container>
      
    </Container>
  );
}

export default List;
