import React from "react";
import { PopupButton } from "react-calendly";

const Calendly = () => {
  return (
    <div className="App">
      <PopupButton className="bg-customYellow text-black py-3 px-6 sm:py-4 sm:px-28 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300"
        url="https://calendly.com/mssuchith"
        /*
         * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
         * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
         */
        rootElement={document.getElementById("root")}
        text="Click here to schedule!"
      />
    </div>
  );
};

export default Calendly;

