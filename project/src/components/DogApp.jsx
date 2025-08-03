import { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, Switch, Space, Row, Col, Tag, Typography, message } from 'antd';
import { PlusOutlined, HeartOutlined, HeartFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dog } from '../entities/Dog';

const { Title, Text } = Typography;
const { TextArea } = Input;

function DogApp() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    try {
      const response = await Dog.list();
      if (response.success) {
        setDogs(response.data);
      }
    } catch (error) {
      message.error('Failed to load dogs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDog = () => {
    setEditingDog(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDog = (dog) => {
    setEditingDog(dog);
    form.setFieldsValue(dog);
    setModalVisible(true);
  };

  const handleDeleteDog = async (dogId) => {
    try {
      await Dog.update(dogId, { deleted: true });
      message.success('Dog removed successfully');
      loadDogs();
    } catch (error) {
      message.error('Failed to remove dog');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDog) {
        await Dog.update(editingDog._id, values);
        message.success('Dog updated successfully');
      } else {
        await Dog.create(values);
        message.success('Dog added successfully');
      }
      setModalVisible(false);
      loadDogs();
    } catch (error) {
      message.error('Failed to save dog');
    }
  };

  const toggleFavorite = async (dog) => {
    try {
      await Dog.update(dog._id, { isFavorite: !dog.isFavorite });
      loadDogs();
    } catch (error) {
      message.error('Failed to update favorite status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="text-4xl font-bold text-gray-800 mb-2">
            🐕 My Dog Collection
          </Title>
          <Text className="text-lg text-gray-600">
            Keep track of all the amazing dogs in your life
          </Text>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddDog}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
          >
            Add New Dog
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Text className="text-lg text-gray-500">Loading dogs...</Text>
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐶</div>
            <Title level={3} className="text-gray-500 mb-2">No dogs yet!</Title>
            <Text className="text-gray-400">Add your first dog to get started</Text>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {dogs.map((dog) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={dog._id}>
                <Card
                  hoverable
                  className="h-full shadow-lg border-0 overflow-hidden"
                  cover={
                    dog.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          alt={dog.name}
                          src={dog.imageUrl}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                        <div className="text-6xl">🐕</div>
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={dog.isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                      onClick={() => toggleFavorite(dog)}
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditDog(dog)}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteDog(dog._id)}
                      danger
                    />
                  ]}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Title level={4} className="mb-0 text-gray-800">
                        {dog.name}
                      </Title>
                      {dog.isFavorite && <HeartFilled className="text-red-500" />}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Tag color="blue">{dog.breed}</Tag>
                        {dog.age && <Tag color="green">{dog.age} years old</Tag>}
                      </div>
                      
                      {dog.color && (
                        <div className="flex items-center gap-2">
                          <Text type="secondary">Color:</Text>
                          <Text>{dog.color}</Text>
                        </div>
                      )}
                      
                      {dog.description && (
                        <Text type="secondary" className="block mt-2 text-sm">
                          {dog.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title={editingDog ? 'Edit Dog' : 'Add New Dog'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter the dog\'s name' }]}
                >
                  <Input placeholder="e.g., Buddy" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Breed"
                  name="breed"
                  rules={[{ required: true, message: 'Please enter the breed' }]}
                >
                  <Input placeholder="e.g., Golden Retriever" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Age" name="age">
                  <InputNumber
                    min={0}
                    max={30}
                    placeholder="Age in years"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Color" name="color">
                  <Input placeholder="e.g., Brown, Black, White" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Photo URL" name="imageUrl">
              <Input placeholder="https://example.com/dog-photo.jpg" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <TextArea
                rows={3}
                placeholder="Tell us about this dog..."
              />
            </Form.Item>

            <Form.Item name="isFavorite" valuePropName="checked">
              <Switch /> <span className="ml-2">Mark as favorite</span>
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingDog ? 'Update Dog' : 'Add Dog'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default DogApp;