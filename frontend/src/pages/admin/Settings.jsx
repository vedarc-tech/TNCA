import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Home,
  Settings as SettingsIcon,
  Save,
  X,
  Calendar,
  Tag,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";

const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    title: "",
    content_type: "announcement",
    content: "",
    image_data: null,
    priority: 1,
    start_date: "",
    end_date: "",
    tags: []
  });

  const contentTypes = [
    { id: 'all', name: 'All Content', icon: FileText },
    { id: 'announcement', name: 'Announcements', icon: Megaphone },
    { id: 'homepage', name: 'Homepage', icon: Home },
    { id: 'instruction', name: 'Instructions', icon: SettingsIcon }
  ];

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    try {
      const url = activeTab === 'all' 
        ? "/api/content/admin" 
        : `/api/content/admin?type=${activeTab}`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      const response = await fetch("/api/content/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Content created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchContent();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create content");
    }
  };

  const handleUpdateContent = async () => {
    try {
      const response = await fetch(`/api/content/admin/${editingContent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Content updated successfully");
        setShowEditModal(false);
        setEditingContent(null);
        resetForm();
        fetchContent();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    
    try {
      const response = await fetch(`/api/content/admin/${contentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Content deleted successfully");
        fetchContent();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  const handleToggleStatus = async (contentId, currentStatus) => {
    try {
      const response = await fetch(`/api/content/admin/${contentId}/toggle-status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchContent();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle content status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content_type: "announcement",
      content: "",
      image_data: null,
      priority: 1,
      start_date: "",
      end_date: "",
      tags: []
    });
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, image_data: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (contentItem) => {
    setEditingContent(contentItem);
    setFormData({
      title: contentItem.title,
      content_type: contentItem.content_type,
      content: contentItem.content,
      image_data: null,
      priority: contentItem.priority,
      start_date: contentItem.start_date ? contentItem.start_date.split('T')[0] : "",
      end_date: contentItem.end_date ? contentItem.end_date.split('T')[0] : "",
      tags: contentItem.tags || []
    });
    setShowEditModal(true);
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const ContentModal = ({ isOpen, onClose, onSubmit, title, isEdit = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Content Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter content title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="announcement">Announcement</option>
                  <option value="homepage">Homepage</option>
                  <option value="instruction">Instruction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority }))}
                      className={`p-2 rounded-lg ${
                        formData.priority === priority
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${formData.priority >= priority ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="content-image"
                  />
                  <label
                    htmlFor="content-image"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </label>
                  {formData.image_data && (
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Image uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                placeholder="Enter content details..."
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    addTag(input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!formData.title || !formData.content}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Update Content' : 'Create Content'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return Megaphone;
      case 'homepage': return Home;
      case 'instruction': return SettingsIcon;
      default: return FileText;
    }
  };

  const getPriorityStars = (priority) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < priority ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Management</h1>
            <p className="text-gray-600">Manage homepage content, announcements, and instructions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{content.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Announcements</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.filter(c => c.content_type === 'announcement').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Homepage Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.filter(c => c.content_type === 'homepage').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === type.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Content List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Content List</h2>
        
        {content.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600 mb-6">Create your first content piece to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Content
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((contentItem) => {
              const TypeIcon = getContentTypeIcon(contentItem.content_type);
              return (
                <div key={contentItem.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <TypeIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{contentItem.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          contentItem.content_type === 'announcement' ? 'bg-yellow-100 text-yellow-800' :
                          contentItem.content_type === 'homepage' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {contentItem.content_type}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getPriorityStars(contentItem.priority)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{contentItem.content}</p>
                      
                      {contentItem.tags && contentItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {contentItem.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Views: {contentItem.view_count}</span>
                        {contentItem.start_date && (
                          <span>From: {new Date(contentItem.start_date).toLocaleDateString()}</span>
                        )}
                        {contentItem.end_date && (
                          <span>To: {new Date(contentItem.end_date).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(contentItem.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(contentItem.id, contentItem.is_active)}
                        className={`p-2 rounded-lg ${
                          contentItem.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {contentItem.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(contentItem)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(contentItem.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {contentItem.image_url && (
                    <div className="mt-4">
                      <img
                        src={contentItem.image_url}
                        alt="Content"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateContent}
        title="Create New Content"
      />

      <ContentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingContent(null);
          resetForm();
        }}
        onSubmit={handleUpdateContent}
        title="Edit Content"
        isEdit={true}
      />
    </div>
  );
};

export default ContentManagement; 