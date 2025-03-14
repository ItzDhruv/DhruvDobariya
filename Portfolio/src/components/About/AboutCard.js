import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple"> DHRUV DOBARIYA</span> { " "}
            from <span className="purple"> Gujarat, India.</span>
            <br />
            I am currently employed as a software developer at CodeMinto.
            <br />
            I specialize in building secure, high-performance blockchain applications, leveraging my expertise in smart contract development and decentralized systems.
            <br />
            <br />
            Apart from coding, some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Playing Games
            </li>
            <li className="about-activity">
              <ImPointRight /> Writing Tech Blogs
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling
            </li>
          </ul>

          <p style={{ color: "		#FFFF00" }}>
            "If it’s easy, everyone can do it."{" "}
          </p>
          <footer className="blockquote-footer" >Dhruv</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
