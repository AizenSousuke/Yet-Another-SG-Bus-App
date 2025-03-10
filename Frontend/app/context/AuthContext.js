import React, { createContext } from "react";

const { Provider, Consumer } = createContext();

const AuthProvider = (props) => {
	return (
		<Provider
			value={{ token: props.value, updateToken: props.updateToken }}
		>
			{props.children}
		</Provider>
	);
};

export { AuthProvider };

export default Consumer;
