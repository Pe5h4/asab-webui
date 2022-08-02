import React, { useMemo, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import {Modal, Nav} from 'reactstrap';
import SidebarItem from './SidebarItem';
import NavbarBrand from './NavbarBrand';
import SidebarBottomItem from './SidebarBottomItem';


const Sidebar = (props) => {
	const [modal, setModal] = useState(false);
	const isSidebarCollapsed = useSelector(state => state.sidebar.isSidebarCollapsed);
	const [windowDimensions, setWindowDimensions] = useState({width: window.innerWidth});

	// Get dynamically hiddden sidebar items from store
	let sidebarHiddenItems = props.sidebarHiddenItems;

	let sidebarItems = props.navigation.getItems().items;

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [windowDimensions]);

	// Filter out sidebar items which has been marked as hidden in ASAB Config module
	if (sidebarHiddenItems) {
		let updatedSidebar = sidebarItems;
		Object.keys(sidebarHiddenItems).map((obj, idx) => {
			if (sidebarItems && Object.values(sidebarItems).some(sidebarObj => sidebarObj.name == sidebarHiddenItems[obj]?.name) && sidebarHiddenItems[obj]?.hide == true) {
				updatedSidebar = updatedSidebar.filter(item => item.name !== sidebarHiddenItems[obj]?.name);
			}
		})
		sidebarItems = updatedSidebar;
	}

	const navConfig = sidebarItems.filter(item => item.name !== "About"),
		unauthorizedNavItems = props.unauthorizedNavItem,
		unauthorizedNavChildren = props.unauthorizedNavChildren,
		aboutItem = props.navigation.getItems().items.filter(item => item.name === "About")[0];

	// Sort items based on config
	const memoizedItemsList = useMemo(() => {
		let itemsList = [...navConfig]
		if (props.sidebarItemsOrder) {
			const sidebarItemsOrder = [...props.sidebarItemsOrder].reverse();
			itemsList.sort((a, b) => {
				if (sidebarItemsOrder.indexOf(a.name) > sidebarItemsOrder.indexOf(b.name)) return -1;
				else return 1;
			});
		}

		if (unauthorizedNavItems != undefined && unauthorizedNavItems.length != 0) {
			itemsList = itemsList.filter((item) => unauthorizedNavItems.indexOf(item.name) == -1);
		}

		return itemsList;
	}, [navConfig])

	function handleResize () {
		setWindowDimensions({width: window.innerWidth});
	}

	const toggle = () => setModal(!modal);

	return (
		windowDimensions.width < 769 ?
		<>
			<div className="mobile-sidebar-burger" onClick={toggle}>
				<i className="cil-menu"></i>
			</div>
			<Modal isOpen={modal} toggle={toggle} className="left">
				<div className="app-sidebar">
					{windowDimensions.width > 769 &&
						<div style={{display: "inline-block"}}>
							<NavbarBrand {...props}/>
						</div>
					}
					<div className="sidebar-nav">

						<Nav  vertical>
							{memoizedItemsList.map((item, idx) => (
								<SidebarItem
									key={idx}
									item={item}
									unauthorizedNavChildren={unauthorizedNavChildren}
									uncollapseAll={memoizedItemsList.length <= 2}
								/>
							))}
						</Nav>
						<SidebarBottomItem item={aboutItem} sidebarLogo={props.sidebarLogo} screenWidth={windowDimensions.width}/>
					</div>
				</div>
			</Modal>
		</>
		:
		<div className={`app-sidebar${isSidebarCollapsed ? " collapsed" : ""}`}>
			{windowDimensions.width > 768 &&
				<div style={{display: "inline-block"}}>
					<NavbarBrand {...props} isSidebarMinimized/>
				</div>
			}
			<div className="sidebar-nav">

				<Nav  vertical>
					{memoizedItemsList.map((item, idx) => (
						<SidebarItem
							key={idx}
							item={item}
							unauthorizedNavChildren={unauthorizedNavChildren}
							uncollapseAll={memoizedItemsList.length <= 2}
						/>
					))}
				</Nav>
				<SidebarBottomItem item={aboutItem} sidebarLogo={props.sidebarLogo} />
			</div>
		</div>
	)
}

function mapStateToProps(state) {
	return {
		unauthorizedNavItem: state.auth?.unauthorizedNavItem,
		unauthorizedNavChildren: state.auth?.unauthorizedNavChildren,
		sidebarHiddenItems: state.sidebar?.sidebarHiddenItems,
		sidebarLogo: state.config?.sidebarLogo
	};
}

export default connect(mapStateToProps)(Sidebar);
