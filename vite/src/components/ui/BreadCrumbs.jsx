import React from 'react';

const BreadCrumbs = ({ crumbs = [], onCrumbClick }) => {
	return (
		<div className="flex flex-row gap-1 items-center">
			{crumbs.map((crumb, index) => {
				const isLast = index === crumbs.length - 1;
				return (
					<React.Fragment key={`${crumb}-${index}`}>
						<span
							className={`text-sm cursor-pointer ${
								isLast ? 'text-text font-medium' : 'text-muted hover:text-text'
							}`}
							onClick={() => !isLast && onCrumbClick?.(crumb, index)}
						>
							{crumb}
						</span>
						{!isLast && <span className="text-sm text-muted">{'>'}</span>}
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default BreadCrumbs;
