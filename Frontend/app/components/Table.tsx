import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-elements";
import AppStyles from "../../assets/css/AppStyles";

const Table = ({ information }: { information: any }) => {
	return (
		<View style={{ display: "flex" }}>
			{information.map((info: any, key: number) => {
				return (
					<View
						style={{
							display: "flex",
						}}
						key={key}
					>
						<View
							style={[
								AppStyles.tableInformationStyle,
								AppStyles.dark,
							]}
						>
							<View style={AppStyles.tableRowInformationStyle}>
								<Text style={AppStyles.tableTextStyle}>
									First Bus
								</Text>
							</View>
							<View style={AppStyles.tableRowInformationStyle}>
								<Text style={AppStyles.tableTextStyle}>
									Last Bus
								</Text>
							</View>
						</View>
						<View style={AppStyles.tableInformationStyle}>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										WEEKDAY
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.wd_firstBus} hrs
									</Text>
								</View>
							</View>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										WEEKDAY
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.wd_lastBus} hrs
									</Text>
								</View>
							</View>
						</View>
						<View style={AppStyles.tableInformationStyle}>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										SAT
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.sat_firstBus} hrs
									</Text>
								</View>
							</View>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										SAT
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.sat_lastBus} hrs
									</Text>
								</View>
							</View>
						</View>
						<View style={AppStyles.tableInformationStyle}>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										SUN
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.sun_firstBus} hrs
									</Text>
								</View>
							</View>
							<View style={AppStyles.tableRowInformationStyle}>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										SUN
									</Text>
								</View>
								<View style={AppStyles.tableRowColumnStyle}>
									<Text style={AppStyles.tableTextStyle}>
										{info.sun_lastBus} hrs
									</Text>
								</View>
							</View>
						</View>
					</View>
				);
			})}
		</View>
	);
};

export default Table;
