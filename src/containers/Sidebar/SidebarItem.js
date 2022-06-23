import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import {
	NavItem, NavLink, Collapse, Nav
} from 'reactstrap';

import Icon from './SidebarIcon';

import { SET_SMALL_SIDEBAR } from '../../actions';

const SidebarItem = ({ 
	item, unauthorizedNavChildren, uncollapseAll
}) => {
	const [isOpen, setOpen] = useState(false);
	const isSmallSidebarOpen = useSelector(state => state.sidebar.isSmallSidebarOpen);

	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();

	const { t } = useTranslation();

	// Should collapsed item uncollapse
	useEffect(() => {
		if (item.children) {
			// if length of all sidebar items is 2 or less
			if (uncollapseAll) {
				setOpen(true);
				return;
			}

			// if child is active
			item.children.forEach(child => {
				if (child.url === location.pathname) {
					setOpen(true);
				}
			});
		}
	}, []);

	 const onNavLink = () => {
		// Preserve from history pushing when item.url doesn't exist
		// or when current location pathname is the same as item.url
		if (item.url && location.pathname !== item.url) history.push(item.url);
		// Preserve from collapsing when item doesn't have children
		// or if item should always be uncollapsed
		else if (item.children && !uncollapseAll) setOpen(prev => !prev);
		// Close small sidebar on item click
		if (isSmallSidebarOpen && window.innerWidth < 768) dispatch({ type: SET_SMALL_SIDEBAR });
	}

	return (
		<>
			<NavItem className="sidebar-item"  title={t(`Sidebar|${item.name}`)}>
				<NavLink onClick={onNavLink}>
					<button className={`sidebar-item-button${location.pathname === item.url ? " active " : " "}btn`}>
						<Icon icon={item.icon} />
						<div className="sidebar-item-name ml-2">{t(`Sidebar|${item.name}`)}</div>
						{item.children && item.children.length > 0 && (
							<Icon icon={isOpen ? "cil-arrow-circle-bottom" : "cil-arrow-circle-left"} />
						)}
					</button>
				</NavLink>

				{item.children &&
					(
						<Collapse isOpen={isOpen}>
							<Nav className="nav-children">
								{item.children.map((child, idx) => (
									unauthorizedNavChildren == undefined || unauthorizedNavChildren.length == 0 ?
										<SidebarItem key={idx} item={child} />
									:
										unauthorizedNavChildren.indexOf(child.name) == -1 && <SidebarItem key={idx} item={child} />
								))}
							</Nav>
						</Collapse>
					)
				}
			</NavItem>
		</>
	)
}

export default SidebarItem;
