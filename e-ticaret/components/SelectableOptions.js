import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

export default function SelectableOptions({ onSelect, categories = [], sizeOptions = [] }) {
    const navigation = useNavigation();
    const { translations } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    const options = [translations.lowestPrice, translations.highestPrice];

    const toggleDropdown = () => setOpen(!open);

    const selectOption = (option) => {
        setSelected(option);
        setOpen(false);
        onSelect(option);
    };

    return (
        <View style={styles.container}>
            {/* Sort By Button Container */}
            <View style={styles.sortContainer}>
                <TouchableOpacity
                    style={[
                        styles.selector,
                        {
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            borderColor: isDarkMode ? theme.border : 'black'
                        }
                    ]}
                    onPress={toggleDropdown}
                >
                    <Ionicons
                        name="swap-vertical"
                        size={20}
                        color={isDarkMode ? theme.text : "#333"}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.selectorText, { color: isDarkMode ? theme.text : '#333' }]}>
                        {selected || translations.sortBy}
                    </Text>
                </TouchableOpacity>

                {/* Dropdown - Sort butonunun tam altında */}
                {open && (
                    <View style={[
                        styles.dropdown,
                        {
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            borderColor: isDarkMode ? theme.border : '#999'
                        }
                    ]}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.option,
                                    { backgroundColor: isDarkMode ? theme.surface : '#fff' },
                                    index !== options.length - 1 && [
                                        styles.optionBorder,
                                        { borderBottomColor: isDarkMode ? theme.border : '#ddd' }
                                    ]
                                ]}
                                onPress={() => selectOption(option)}
                            >
                                <Text style={[styles.optionText, { color: isDarkMode ? theme.text : '#333' }]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Filter Button */}
            <TouchableOpacity
                style={[
                    styles.selector,
                    {
                        flexDirection: "row",
                        backgroundColor: isDarkMode ? theme.surface : '#fff',
                        borderColor: isDarkMode ? theme.border : 'black'
                    }
                ]}
                onPress={() => {
                    navigation.navigate("Filter", {
                        categories: categories,
                        sizeOptions: sizeOptions
                    })
                }}
            >
                <Ionicons
                    style={{ marginRight: 20 }}
                    name="filter"
                    size={24}
                    color={isDarkMode ? theme.text : "black"}
                />
                <Text style={{ color: isDarkMode ? theme.text : '#333' }}>
                    {translations.filter}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    sortContainer: {
        position: 'relative',
        marginRight: 15,
    },
    selector: {
        width: 160,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderColor: 'orange',
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    dropdown: {
        position: 'absolute',
        top: 52, // Sort butonunun hemen altında (button height + 2px spacing)
        left: 0,
        zIndex: 3001, // En yüksek z-index
        width: 160, // Sort butonu ile aynı genişlik
        backgroundColor: '#fff',
        borderColor: '#999',
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10, // Android için çok yüksek elevation
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});