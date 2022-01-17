import { SET_SIDEBAR, CHANGE_SIDEBAR_SIZE, SET_SMALL_SIDEBAR } from "../actions";

const initialState = {
	isSidebarOpen: true,
	isSidebarMinimized: false,
	isSmallSidebarOpen: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_SIDEBAR: {
			return {
				...state,
				isSidebarOpen: !state.isSidebarOpen,
			}
		}
		case CHANGE_SIDEBAR_SIZE: {
			return {
				...state,
				isSidebarMinimized: !state.isSidebarMinimized
			}
		}
		case SET_SMALL_SIDEBAR: {
			return {
				...state,
				isSmallSidebarOpen: !state.isSmallSidebarOpen
			}
		}
		default: {
			return state;
		}

	}
}
