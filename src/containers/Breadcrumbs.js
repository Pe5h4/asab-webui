import React from 'react';
import { Link } from 'react-router-dom';

import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

const Breadcrumbs = ({ routes, match }) => {

	// Get new crumbs each time location has been changed
	const crumbs = routes.filter(({ path }) => match.path.includes(path)).
		map(({ path, ...rest }) => ({
			path: Object.keys(match.params).length ?
				Object.keys(match.params).reduce((path, param) =>
					path.replace(`:${param}`, match.params[param]), path
				) : path,
				...rest
		})).
		filter(crumb => crumb.name);

	return (
		<>
			<div className="breadcrumbs">
				<Breadcrumb>
					{crumbs.map((crumb, idx) => (
						<BreadcrumbItem key={idx} active={idx === crumbs.length - 1}>
							{idx !== crumbs.length - 1 ? 
								<Link to={crumb.path}>{crumb.name}</Link>
								: <span>{crumb.name}</span>
							}
						</BreadcrumbItem>
					))
					}
				</Breadcrumb>
			</div>
		</>
	)
}

export default Breadcrumbs;
