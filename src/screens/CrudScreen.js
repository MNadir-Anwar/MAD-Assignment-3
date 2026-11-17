import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@app_records_v1';
const CATEGORIES = ['All', 'Work', 'Personal', 'Study'];

export default function CrudScreen() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [editingId, setEditingId] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 1. Load records from AsyncStorage on app launch
  useEffect(() => {
    loadRecords();
  }, []);

  // Save records whenever the records state changes
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const loadRecords = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setRecords(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load saved data.');
    }
  };

  const saveRecords = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      Alert.alert('Error', 'Failed to save data locally.');
    }
  };

  // 2. Create or Update Record
  const handleSaveRecord = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }

    if (editingId) {
      // UPDATE existing record using map()
      const updatedRecords = records.map((item) =>
        item.id === editingId
          ? { ...item, title: title.trim(), description: description.trim(), category }
          : item
      );
      setRecords(updatedRecords);
      setEditingId(null);
    } else {
      // CREATE new record
      const newRecord = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        category,
      };
      setRecords([newRecord, ...records]);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Work');
    Keyboard.dismiss();
  };

  // Populate form for editing
  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
  };

  // 3. Delete Record
  const handleDelete = (id) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = records.filter((item) => item.id !== id);
          setRecords(filtered);
          if (editingId === id) {
            setEditingId(null);
            setTitle('');
            setDescription('');
          }
        },
      },
    ]);
  };

  // 4. Search & Filter Logic using JS Array Methods (filter & some)
  const filteredRecords = records.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesSearch = [item.title, item.description, item.category].some(
      (field) => field && field.toLowerCase().includes(query)
    );

    return matchesCategory && matchesSearch;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.cardDesc}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionHeader}>
          {editingId ? 'Update Record' : 'Add New Record'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Title *"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Description (optional)"
          value={description}
          onChangeText={setDescription}
        />

        {/* Category Selector for Form */}
        <View style={styles.categoryRow}>
          {['Work', 'Personal', 'Study'].map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.catChip,
                category === cat && styles.catChipSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.catChipText,
                  category === cat && styles.catChipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.submitBtn} onPress={handleSaveRecord}>
          <Text style={styles.submitBtnText}>
            {editingId ? 'Update Item' : 'Add Item'}
          </Text>
        </Pressable>
      </View>

      {/* Search & Category Filter */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title, description, or category..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.filterChip,
              selectedCategory === cat && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextSelected,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching records found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9', padding: 14 },
  formCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1E293B' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  catChipSelected: { backgroundColor: '#2563EB' },
  catChipText: { color: '#334155', fontSize: 13 },
  catChipTextSelected: { color: '#FFF', fontWeight: 'bold' },
  submitBtn: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  searchInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  filterChipSelected: { backgroundColor: '#0F172A' },
  filterText: { fontSize: 12, color: '#334155' },
  filterTextSelected: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', flex: 1 },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: '#1D4ED8', fontSize: 12, fontWeight: '600' },
  cardDesc: { color: '#475569', marginTop: 6, fontSize: 14 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  editBtn: { backgroundColor: '#F59E0B' },
  deleteBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
});