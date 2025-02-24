import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, Pressable, Platform } from 'react-native';
import { Menu, Provider } from 'react-native-paper'; // Ensure correct import
import axios from 'axios';

const API_URL = 'http://192.168.1.8:8000'; // Update with your Mac’s IP (verify it matches)

export default function App() {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('Next Actions');
  const [tasks, setTasks] = useState([]);
  const [visible, setVisible] = useState(false); // State for menu visibility

  const categories = ['Next Actions', 'Waiting For', 'Someday-Maybe']; // Dropdown options

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.log('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (task.trim()) {
      try {
        const response = await axios.post(`${API_URL}/tasks`, { text: task, category });
        setTasks([...tasks, response.data]);
        setTask('');
      } catch (error) {
        console.log('Error adding task:', error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId)); // Update state to remove the task
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Provider> {/* Wrap app with Provider for react-native-paper */}
      <View style={styles.container}>
        <Text style={styles.title}>My Task List</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a task"
            value={task}
            onChangeText={setTask}
          />
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Pressable onPress={openMenu} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{category}</Text>
              </Pressable>
            }
          >
            {categories.map((item) => (
              <Menu.Item
                key={item}
                onPress={() => {
                  setCategory(item);
                  closeMenu();
                }}
                title={<Text>{item}</Text>} // Wrapped in <Text> to prevent warnings
              />
            ))}
          </Menu>
          <Button
            title="Add Task"
            onPress={addTask}
            mode="contained"
            style={styles.addButton}
          />
        </View>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskItemContainer}>
              <Text style={styles.taskItem}>{item.text} ({item.category})</Text>
              <Pressable onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>X</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column', // Stack vertically on mobile, row on web
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch', // Stretch on mobile, center on web
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: Platform.OS === 'ios' ? 10 : 0, // Add spacing on iOS mobile
    marginRight: Platform.OS === 'web' ? 10 : 0, // Add spacing on web
  },
  dropdownButton: {
    width: '100%', // Full width on mobile
    height: 44, // Standard height
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 0, // Space below on iOS mobile
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 10, // Add padding for text alignment
  },
  addButton: {
    marginTop: Platform.OS === 'ios' ? 10 : 0, // Space above on iOS mobile
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskItem: {
    padding: 10,
    flex: 1, // Allow text to take available space
  },
  deleteButton: {
    padding: 5,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    marginLeft: 10, // Space between text and button
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});