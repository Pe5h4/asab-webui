import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { NavLink } from 'reactstrap';

import { CHANGE_THEME } from "./actions";

const ThemeButton = ({theme}) => {
	const { t, i18n } = useTranslation();
	const dispatch = useDispatch();

	const changeTheme = () => {
		const newTheme = (theme == "light") ? "dark" : "light";
		dispatch({
			type: CHANGE_THEME,
			theme: newTheme
		});
	}

	return (
		<NavLink 
			style={{ fontSize: "1.1rem", marginRight: "1rem", paddingTop: "0.4rem" }}
			onClick={changeTheme}
			title={t("Change theme")}
			href="#"
		>
			<i className="cil-contrast"></i>
		</NavLink>
	);
}


function mapStateToProps(state) {
	return {
		theme: state.theme,
	}
}

export default connect(mapStateToProps)(ThemeButton);
