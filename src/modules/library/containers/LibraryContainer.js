import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import {
	Container, Row, Col, 
	Card, CardHeader, Button,
	ButtonGroup, DropdownMenu, DropdownItem
} from "reactstrap";

import TreeMenu from '../../../components/TreeMenu';
import ControlledSwitch from '../../../components/ControlledSwitch';
import SwitchPanel from "./SwitchPanel";
import { formatIntoTree } from "./formatIntoTree";

import './styles.scss';

const languages = {
	'.html': 'html',
	'.xml': 'xml',
	'.js': 'javascript',
	'.py': 'python',
	'.yaml': 'yaml',
	'.yml': 'yaml',
	'.json': 'json',
	'.css': 'css',
	'.scss': 'scss'
}

function LibraryContainer(props) {

	const App = props.app;
	const LMioLibraryAPI = App.axiosCreate('lmio_library');
	const serviceURL = App.getServiceURL('lmio_library');
	const history = useHistory();
	const location = useLocation()
	const { t } = useTranslation();
	
	const currentTenant = useSelector(state => state.tenant.current);
	const [treeData, setTreeData] = useState({});
	const [originalFileContent, setOgFileContent] = useState("");
	const [fileContent, setFileContent] = useState("");
	const [activeNode, setActiveNode] = useState({ });
	const [isFileDisabled, setFileDisabled] = useState("hide");
	const [isReadOnly, setReadOnly] = useState(true);
	const [language, setLanguage] = useState('');
	const [chosenPanel, setChosenPanel] = useState("editor");
	const [isDropdownMenuOpen, setDropdownMenu] = useState(false);
	const isComponentMounted = useRef(true);

	useEffect(() => {
		retrieveTreeData();

		// in case if component was unmounted before tree data was downloaded
		return () => { isComponentMounted.current = false };
	}, []);

	useEffect(() => {
		const splittedPathname = location.pathname.replace('/library', '').split("/");
		const name = splittedPathname[splittedPathname.length-1];
		const path = location.pathname.substring(9);

		setActiveNode({ path, name })
		retrieveFileContent(path);
	}, [location])

	useEffect(() => {
		// copy originalFileContent for edditing
		// copy is required in order to discard changes
		setFileContent(originalFileContent);
		setFileLanguage(activeNode.name);
	}, [originalFileContent])

	useEffect(() => {
		// set up edit mode
		if (!activeNode.path) {
			setReadOnly(true);
		}
	}, [activeNode])

	// Get tree data from the server
	const retrieveTreeData = async () => {
		try {
			// Make request for initial data
			const response = await LMioLibraryAPI.get("/library/list/", { params: { recursive: true, tenant: currentTenant }});
			// Format response for <TreeMenu />
			if (response.data.result != "OK") throw new Error ({ response });
			const treeMenu = formatIntoTree(response.data.data)

			// Set state if LibraryContainer is mounted
			// if component has been unmounted then isComponentMounted.current was set to false
			// in useEffect which calls this function
			if (isComponentMounted.current) {
				const compare = (a, b) => {
					if (a.type === "folder" && b.type === "file") {
						return -1;
					} else if (b.type === "folder" && a.type === "file") {
						return 1;
					} else return 0;
				}
				const sortedTreeMenu = treeMenu.sort(compare)
				setTreeData(sortedTreeMenu);
			}
		} catch (e) {
			// If response.status !== 2xx then catch block will be executed
			console.error("Error when retrieving tree data\n", e); // log the error to the browser's console
			App.addAlert("warning", t('ASABLibraryModule|Failed to load data'));
		}

	}

	const retrieveFileContent = async (path) => {
		// Requesting the endpoint and getting files content
		if (path) {
			try {
				const response = await LMioLibraryAPI.get(`/library/item/${path}`, { params: { tenant: currentTenant }});
				if (response.data) {
					if (typeof response.data == "string") setOgFileContent(response.data);
					else setOgFileContent(JSON.stringify(response.data, null, 4));
					const fileState = response.headers["x-splang-disabled"] === "True" ? true : false;
					setFileDisabled(fileState);
				} else {
					setOgFileContent("");
					setFileDisabled("hide");
				}
			} catch (e) {
				console.error("Error when retrieving file content: ", e); // log the error to the browser's console
				App.addAlert("warning", t('ASABLibraryModule|Failed to load content of the file'));
				setOgFileContent("");
			}
		}
	};

	const retrieveAll = () => {
		retrieveFileContent();
		retrieveTreeData();
	}

	const switchFileState = async () => {
		if (activeNode.path) {
			try {
				const newState = !isFileDisabled;
				const response = await LMioLibraryAPI.put(`/library/item-disable/${activeNode.path}`, null , { params: { tenant: currentTenant, disable: newState ? "yes" : "no" }});

				if (response.data.result != "OK") throw new Error(`Response result is ${response.data.result}. State of the file has not been updated`);

				setFileDisabled(newState);
				retrieveTreeData();
			} catch (e) {
				console.error("Error when swicthing file state\n", e);
				props.app.addAlert("warning", t(`ASABLibraryModule|Failed to ${isFileDisabled ? "enable" : "disable"} file`));
			}
		}
	}

	const updateFileContent = async () => {
		if (originalFileContent === fileContent) return ;

		try {
			const response = await LMioLibraryAPI.put("/library/item/" + activeNode.path, 
				JSON.stringify({ "content": fileContent }),
				{ headers:
					{
						'Content-Type': 'application/json'
					}
				}
			);

			if (response.data.result !== "OK")
				throw new Error("Something went wrong.\nResult: " + response.data.result);

			props.app.addAlert("success", t(`ASABLibraryModule|File has been updated`));
			setOgFileContent(fileContent);
			setReadOnly(true);
		} catch (e) {
			console.error("Error when updating file content\n",e);
			props.app.addAlert("warning", t(`ASABLibraryModule|Failed to update the file`));
		}
	}

	const setFileLanguage = value => {
		const extension = value?.match(/\.[0-9a-z]+$/i)[0];
		setLanguage(languages[extension] || null);
	}

	const editFileContent = value => {
		setFileContent(value);
	}

	const cancelChanges = () => {
		const confirmation = confirm(t("ASABLibraryModule|Are you sure you want to cancel changes?"));
		if (confirmation) {
			setFileContent(originalFileContent);
			setReadOnly(true);
			retrieveFileContent(activeNode.path);
		}
	}

	const onTreeMenuItemClick = ({ key, type }) => {
		// Push params to the URL
		if (history.location.pathname !== `/library/${key}` && type === "file") {
			history.push({
				pathname: `/library/${key}`,
			})
		}

		// switch to editor
		setChosenPanel("editor");
	}

	const TreeMenuDropdownMenu = (
		<DropdownMenu>
				<a href={`${serviceURL}/library/download`} download className="text-dark dropdown-export-item w-100">
					<DropdownItem
						style={{
							borderBottom: "1px solid #c8ced3",
							borderRadius: 0
						}}
					>
						<i className="cil-cloud-download mr-2" />
						{t("ASABLibraryModule|Export")}
					</DropdownItem>
				</a>
				<DropdownItem onClick={() => setChosenPanel("import")}>
					<i className="cil-cloud-upload mr-2" />
					{t("ASABLibraryModule|Import")}
				</DropdownItem>
		</DropdownMenu>
	);

	// Render function
	return (
		<Container fluid className="mt-0 h-100 library-container">
			<Row className="ml-0 h-100">
				<Col xs="3" sm="3" className="tree-menu">
					<TreeMenu
						data={treeData}
						hasSearch={true} // The search option is nice, but has no api to translate the hint/placeholder
						onClickItem={onTreeMenuItemClick}
						initialActiveKey={location.pathname.replace('/library', '')}
						initialFocusKey={location.pathname.replace('/library', '')}
						initialOpenNodes={location.pathname.replace('/library', '').split("/")}
						searchOptions={{
							placeholder: t("ASABLibraryModule|Search"),
							dropdown: {
								title: t("ASABLibraryModule|Actions"),
								children: TreeMenuDropdownMenu
							}
						}}
					/>
				</Col>
				<Col xs="9" sm="9">
					<Card className="h-100">
						<CardHeader style={{ height: "50px" }}>
							<div
								style={{ height: "28px" }}
								className="d-flex justify-content-between align-items-center"
							>
								<div>
									{activeNode.name && chosenPanel === "editor" && (
										<>
											<span className="cil-library mr-3" />
											<span className="mr-2">{activeNode.name}</span>
											{isFileDisabled !== "disable-switch" && (
												<ControlledSwitch
													size="sm"
													isOn={!isFileDisabled}
													toggle={switchFileState}
													title={t(`ASABLibraryModule|${isFileDisabled ? "Enable" : "Disable"} file`)}
												/>
											)}
										</>
									)}
								</div>
								<ButtonGroup>
									{activeNode.name && isReadOnly && chosenPanel === "editor" && (
										<Button
											outline
											color="secondary"
											onClick={() => setReadOnly(false)}
										>
											{t("ASABLibraryModule|Edit")}
										</Button>
									)}
									{chosenPanel !== "editor" && (
										<Button
											size="sm"
											color="danger"
											className="mr-2"
											onClick={() => setChosenPanel("editor")}
										>
											{t("ASABLibraryModule|Back")}
										</Button>
									)}
									{activeNode.name && !isReadOnly && (
										<div>
											<Button
												size="sm"
												color="success"
												className="mr-2"
												onClick={updateFileContent}
												disabled={originalFileContent === fileContent}
											>
												{t("ASABLibraryModule|Save")}
											</Button>
											<Button
												size="sm"
												color="danger"
												onClick={cancelChanges}
											>
												{t("ASABLibraryModule|Cancel")}
											</Button>
										</div>
									)}
								</ButtonGroup>
							</div>
						</CardHeader>

						<SwitchPanel
							app={props.app}
							api={LMioLibraryAPI}
							chosenPanel={chosenPanel}
							setChosenPanel={setChosenPanel}
							retrieveAll={retrieveAll}
							editor={{
								language,
								isReadOnly,
								fileContent,
								editFileContent
							}}
						/>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default LibraryContainer;
