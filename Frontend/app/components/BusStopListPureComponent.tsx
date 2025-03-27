import React, { PureComponent } from "react";
import { Pressable, Text, ToastAndroid, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { Icon, ListItem, Overlay } from "react-native-elements";
import AppStyles from "../../assets/css/AppStyles";
import { AddCodeToSettings, GetBusStop, SaveSettings } from "../api/api";
import AuthConsumer from "../context/AuthContext";
import BusStop from "./BusStop";
import SettingsConsumer from "../context/SettingsContext";

interface Props {
	name: string;
	address: string;
	code: string;
	CollapseEvent: (code: string) => any;
}

interface State {
	isCollapsed: boolean;
	arrow: boolean;
	overlayVisible: boolean;
	busStopData: any;
}

/**
 * Component for Location and Search pages
 */
export default class BusStopListPureComponent extends PureComponent<
	Props,
	State
> {
	constructor(props: any) {
		super(props);
		this.state = {
			arrow: false,
			overlayVisible: false,
			isCollapsed: true,
			busStopData: null,
		};
		this.getBusStopData = this.getBusStopData.bind(this);
		// Don't load data on mount
		// this.getBusStopData();
	}

	getBusStopData() {
		GetBusStop(this.props.code)
			.then((res) => {
				this.setState(
					(prevState) => {
						return { ...prevState, busStopData: res.data };
					},
					() => {}
				);
			})
			.catch((error) => console.error(error));
	}

	componentWillUnmount() {
		// fix Warning: Can't perform a React state update on an unmounted component
		this.setState = (state, callback) => {
			return;
		};
	}

	render() {
		const { name, address, code } = this.props;

		return (
				<>
					<ListItem
						topDivider
						bottomDivider
						onPress={() => {
							this.setState(
								(state) => ({
									isCollapsed: !state.isCollapsed,
								}),
								() => {
									// For use in Location page
									if (
										!this.state.isCollapsed &&
										this.props.CollapseEvent
									) {
										// console.log("Firing CollapseEvent event");
										this.props.CollapseEvent(this.props.code);
									}

									// if state is not collapsed, then load data
									if (!this.state.isCollapsed) {
										console.log(`Loading bus stop data for bus stop code: ${code}`);
										this.getBusStopData();
									}
								}
							);
							this.setState((state) => ({ arrow: !state.arrow }));
						}}
						hasTVPreferredFocus={undefined}
						tvParallaxProperties={undefined}
					>
						<Icon
							name={
								this.state.arrow
									? "keyboard-arrow-down"
									: "keyboard-arrow-right"
							}
							tvParallaxProperties={undefined}
						/>
						<ListItem.Content>
							<ListItem.Title>
								<Text style={AppStyles.busStopName}>
									{name ?? "Bus Stop Name"}
								</Text>
							</ListItem.Title>
							<ListItem.Subtitle>
								<Text style={AppStyles.busStopRoadName}>
									{address ?? "Address"} (
									{code ?? "Bus Stop Code"})
								</Text>
							</ListItem.Subtitle>
						</ListItem.Content>
						{this.state.isCollapsed ? (
							<Pressable
								onPress={() =>
									this.setState((state) => ({
										overlayVisible: !state.overlayVisible,
									}))
								}
								android_ripple={{ borderless: true }}
							>
								<View>
									<Icon
										name="more-vert"
										tvParallaxProperties={undefined}
									/>
									<Overlay
										isVisible={this.state.overlayVisible}
										onBackdropPress={() =>
											this.setState((state) => ({
												overlayVisible:
													!state.overlayVisible,
											}))
										}
									>
										<SettingsConsumer>
											{(settings: any) => {
												return (
												<AuthConsumer>
													{(auth) => {
														console.log(
															"Auth: " + JSON.stringify(auth)
														);
														console.log(
															"Auth token: " +
																JSON.stringify(auth.token)
														);
														return (
															<View>
																<ListItem
																	hasTVPreferredFocus={
																		undefined
																	}
																	tvParallaxProperties={
																		undefined
																	}
																>
																	<ListItem.Title>
																		Add to:
																	</ListItem.Title>
																</ListItem>
																<ListItem
																	onPress={() => {
																		this.setState(
																			(state) => ({
																				overlayVisible:
																					!state.overlayVisible,
																			}),
																			() => {
																				// SaveSettings(
																				// 	auth.token,
																				// 	code
																				// )
																				AddCodeToSettings(
																					auth.token,
																					code
																				)
																					.then(
																						(
																							res
																						) => {
																							ToastAndroid.show(
																								res.msg,
																								ToastAndroid.SHORT
																							);

																							// Refresh state
																							settings?.updateSettings();
																						}
																					)
																					.catch(
																						(
																							error
																						) => {
																							ToastAndroid.show(
																								"Error when saving setting",
																								ToastAndroid.SHORT
																							);
																						}
																					);
																			}
																		);
																	}}
																	hasTVPreferredFocus={
																		undefined
																	}
																	tvParallaxProperties={
																		undefined
																	}
																>
																	<ListItem.Subtitle>
																		Going Out
																	</ListItem.Subtitle>
																</ListItem>
																<ListItem
																	onPress={() => {
																		this.setState(
																			(state) => ({
																				overlayVisible:
																					!state.overlayVisible,
																			}),
																			() => {
																				// SaveSettings(
																				// 	auth.token,
																				// 	code,
																				// 	false
																				// )
																				AddCodeToSettings(
																					auth.token,
																					code,
																					false
																				)
																					.then(
																						(
																							res
																						) => {
																							ToastAndroid.show(
																								res.msg,
																								ToastAndroid.SHORT
																							);
																							
																							// Refresh state
																							settings?.updateSettings();
																						}
																					)
																					.catch(
																						(
																							error
																						) => {
																							ToastAndroid.show(
																								"Error when saving setting",
																								ToastAndroid.SHORT
																							);
																						}
																					);
																			}
																		);
																	}}
																	hasTVPreferredFocus={
																		undefined
																	}
																	tvParallaxProperties={
																		undefined
																	}
																>
																	<ListItem.Subtitle>
																		Going Home
																	</ListItem.Subtitle>
																</ListItem>
															</View>
														);
													}}
												</AuthConsumer>
											)}}
										</SettingsConsumer>
									</Overlay>
								</View>
							</Pressable>
						) : (
							<Pressable
								onPress={() => {
									console.log("Refreshing bus stop " + code);
									this.getBusStopData();
								}}
								android_ripple={{ borderless: true }}
							>
								<View>
									<Icon
										name="refresh"
										tvParallaxProperties={undefined}
									/>
								</View>
							</Pressable>
						)}
					</ListItem>
					<Collapsible collapsed={this.state.isCollapsed}>
						{this.state.busStopData != null ? (
							<BusStop busStopData={this.state.busStopData} />
						) : (
							<Text style={AppStyles.busStopNoData}>No Data</Text>
						)}
					</Collapsible>
				</>
		);
	}
}
