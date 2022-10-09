import { ReactHTMLElement, useRef, useState } from "react";
import {
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemeProps } from "./interfaces/theme";
import { DARK, LIGHT } from "./constants/themes";
import { BUTTONS } from "./constants/buttons";

interface OperationProps {
  value: string;
  operator: string;
}

export default function App() {
  const operationsList = useRef(null);
  const [theme, setTheme] = useState<ThemeProps>(DARK);
  const [operations, setOperations] = useState<OperationProps[]>([]);
  const [operationsRefresh, setOperationsRefresh] = useState<boolean>(false);
  const [result, setResult] = useState<number>(0);

  const setThemeDark = (): void => setTheme(DARK);
  const setThemeLight = (): void => setTheme(LIGHT);

  const onPress = (value: string, type: string): void => {
    let position =
      operations.length - 1 < 0 ? operations.length : operations.length - 1;

    if (operations[position]) {
      if (value === "." && operations[position].value.includes(".")) return;
      if (value === "<-") {
        if (operations[position].operator !== "")
          operations[position].operator = "";
        else if (operations[position].value !== "")
          operations[position].value = "";
        else {
          operations.splice(position, 1);
          position--;
        }
      }
    }

    if (type === "number" && value !== "<-") {
      if (!operations[position]) {
        operations[position] = {
          value,
          operator: "",
        };
      } else if (operations[position] && operations[position].operator === "") {
        const number = operations[position].value;
        operations[position].value = number + value;
      } else if (operations[position] && operations[position].operator !== "") {
        operations[position + 1] = {
          value,
          operator: "",
        };
      }
    } else if (type === "primary") {
      if (value === "=") {
        let result = 0,
          lastOperator = "";
        operations.map((operation) => {
          switch (lastOperator) {
            case "+":
              result += Number(operation.value);
              break;
            case "-":
              result -= Number(operation.value);
              break;
            case "x":
              result *= Number(operation.value);
              break;
            case "/":
              result /= Number(operation.value);
              break;
            default:
              result = Number(operation.value);
              break;
          }

          lastOperator = operation.operator;
        });

        if (result > 0) {
          const operation = {
            value: result.toString(),
            operator: "",
          };
          setOperations([operation]);
        } else setOperations([]);
        setResult(result);
        return;
      } else {
        if (!operations[position]) {
          operations[position] = {
            value: "",
            operator: value,
          };
        } else {
          operations[position].operator = value;
        }
      }
    } else if (type === "secondary") {
      if (value === "AC") {
        setOperations([]);
        setResult(0);
        setOperationsRefresh(!operationsRefresh);

        return;
      }
    }

    setOperations(operations);
    setOperationsRefresh(!operationsRefresh);

    if (operationsList.current) {
      operationsList.current.scrollToEnd();
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor={theme.screenBackground}
        barStyle={theme === DARK ? "light-content" : "dark-content"}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.screenBackground }]}
      >
        <View style={styles.screenContainer}>
          <View
            style={[
              styles.themeButtons,
              { backgroundColor: theme.padBackground },
            ]}
          >
            <TouchableOpacity
              onPress={setThemeLight}
              style={styles.themeButton}
            >
              <Feather
                name="sun"
                size={20}
                color={theme === LIGHT ? theme.text : theme.inactiveButton}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={setThemeDark} style={styles.themeButton}>
              <Feather
                name="moon"
                size={20}
                color={theme === DARK ? theme.text : theme.inactiveButton}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.textContainer}>
            <FlatList
              ref={operationsList}
              showsHorizontalScrollIndicator={false}
              extraData={operationsRefresh}
              horizontal
              contentContainerStyle={styles.textOperations}
              data={operations}
              renderItem={({ item, index }) => (
                <View key={index} style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.textOperationsNumber, { color: theme.text }]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      styles.textOperationsOperator,
                      { color: theme.primaryButton },
                    ]}
                  >
                    {item.operator}
                  </Text>
                </View>
              )}
            />
            <Text style={[styles.textResults, { color: theme.text }]}>
              {result}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.padContainer,
            { backgroundColor: theme.padBackground },
          ]}
        >
          {BUTTONS.map((button, index) => (
            <TouchableOpacity
              onPress={() => onPress(button.text, button.type)}
              key={index}
              style={[
                styles.padButton,
                { backgroundColor: theme.buttonBackground },
              ]}
            >
              <Text
                style={[
                  styles.padButtonText,
                  (button.type === "number" && { color: theme.text }) ||
                    (button.type === "primary" && {
                      color: theme.primaryButton,
                    }) ||
                    (button.type === "secondary" && {
                      color: theme.secondaryButton,
                    }),
                ]}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    height: "35%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  themeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  textContainer: {
    alignItems: "flex-end",
    width: "100%",
  },
  textOperations: {
    flexDirection: "row",
    height: 25,
  },
  textOperationsNumber: {
    marginLeft: 10,
    fontSize: 19,
    letterSpacing: 2,
  },
  textOperationsOperator: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 10,
  },
  textResults: {
    fontSize: 46,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  padContainer: {
    height: "65%",
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  padButton: {
    padding: 10,
    height: 65,
    width: 65,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  padButtonText: {
    fontWeight: "bold",
    fontSize: 20,
  },
});
