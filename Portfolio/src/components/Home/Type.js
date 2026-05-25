import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          "",
         "Software Developer",
         "Blockchain Developer",
         "Open Source Contributor",
         "Freelancer",
         "Smart Contract Developer"
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
      }}
    />
  );
}

export default Type;
