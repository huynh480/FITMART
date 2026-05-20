import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Modal, Form, message, Popconfirm, Spin, Alert } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { categoriesApi } from '../../services/api';

/* ─── Helper: Vietnamese slug (hiển thị UI, không gửi lên API) ─── */
function toSlug(str) {
  return str.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form] = Form.useForm();

  /* ── Fetch ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data ?? []);
    } catch (e) {
      setError(`Không thể tải danh mục: ${e.message}`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Helpers ── */
  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (cat) => {
    setEditing(cat);
    form.setFieldsValue({ name: cat.name, description: cat.description ?? '' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); form.resetFields(); };

  const handleNameChange = (e) => {
    if (!editing) form.setFieldsValue({ slug: toSlug(e.target.value) });
  };

  /* ── Save ── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { id: editing?.id ?? 0, name: values.name, description: values.description ?? '' };
      if (editing) {
        await categoriesApi.update(editing.id, payload);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await categoriesApi.create(payload);
        message.success('Thêm danh mục thành công!');
      }
      closeModal();
      await fetchCategories();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(`Lỗi: ${e.message}`);
    } finally { setSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (cat) => {
    try {
      await categoriesApi.remove(cat.id);
      message.success('Xoá danh mục thành công!');
      await fetchCategories();
    } catch (e) {
      message.error(`Xoá thất bại: ${e.message}`);
    }
  };

  /* ── Columns ── */
  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name',
      render: (n) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: 'Slug (hiển thị)', key: 'slug',
      render: (_, r) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6e6e6e', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
          {toSlug(r.name)}
        </span>
      ) },
    { title: 'Mô tả', dataIndex: 'description', key: 'description',
      render: (d) => d || <span style={{ color: '#bbb' }}>—</span> },
    { title: 'Hành động', key: 'actions', width: 180,
      render: (_, rec) => (
        <div className="admin-products__actions">
          <button className="admin-products__action-btn" onClick={() => openEdit(rec)}>✏️ Sửa</button>
          <Popconfirm title="Xác nhận xoá" description={`Xoá danh mục "${rec.name}"?`}
            onConfirm={() => handleDelete(rec)} okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}>
            <button className="admin-products__action-btn admin-products__action-btn--delete">🗑️ Xoá</button>
          </Popconfirm>
        </div>
      ) },
  ];

  return (
    <>
      <div className="admin-products__toolbar">
        <div className="admin-content__header" style={{ marginBottom: 0 }}>
          <h1 className="admin-content__title">Quản lý danh mục</h1>
          <p className="admin-content__subtitle">{categories.length} danh mục trong hệ thống</p>
        </div>
        <button className="admin-products__add-btn" onClick={openAdd}>
          <PlusOutlined /> Thêm danh mục
        </button>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}

      <div className="admin-products__table-wrap" style={{ marginTop: 20 }}>
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          <Table columns={columns} dataSource={categories} rowKey="id"
            pagination={{ pageSize: 20, showSizeChanger: false }} size="middle" />
        </Spin>
      </div>

      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen} onOk={handleSave} onCancel={closeModal}
        okText={editing ? 'Cập nhật' : 'Lưu'} cancelText="Huỷ"
        confirmLoading={saving} width={480} destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="VD: Áo T-Shirt" onChange={handleNameChange} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về danh mục…" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
