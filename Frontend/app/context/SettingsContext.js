import React, { createContext } from "react";

const { Provider, Consumer } = createContext(null);

const SettingsProvider = (props) => {
	return (
		<Provider
			value={{
				settings: props.value,
				updateSettings: props.updateSettings,
			}}
		>
			{props.children}
		</Provider>
	);
};

export { SettingsProvider };

export default Consumer;
