import React, { useState } from 'react';
import { Table, Input, Modal, Form, Select, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

/* ─── Helper: Vietnamese slug ─── */
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ─── Mock data ─── */
const initialCategories = [
  { id: 1, name: 'Áo Nam',    slug: 'ao-nam',    parentId: null, productCount: 18 },
  { id: 2, name: 'Quần Nam',  slug: 'quan-nam',  parentId: null, productCount: 12 },
  { id: 3, name: 'Áo Nữ',    slug: 'ao-nu',     parentId: null, productCount: 14 },
  { id: 4, name: 'Quần Nữ',  slug: 'quan-nu',   parentId: null, productCount: 10 },
  { id: 5, name: 'Phụ kiện',  slug: 'phu-kien',  parentId: null, productCount: 8 },
  { id: 6, name: 'T-Shirt',   slug: 'ao-t-shirt', parentId: 1,   productCount: 7 },
  { id: 7, name: 'Tank Top',  slug: 'ao-tank-top', parentId: 1,  productCount: 4 },
  { id: 8, name: 'Hoodie',    slug: 'ao-hoodie',  parentId: 1,   productCount: 5 },
  { id: 9, name: 'Short',     slug: 'quan-short', parentId: 2,   productCount: 6 },
  { id: 10, name: 'Jogger',   slug: 'quan-jogger', parentId: 2,  productCount: 4 },
  { id: 11, name: 'Sports Bra', slug: 'sports-bra', parentId: 3, productCount: 5 },
  { id: 12, name: 'Legging',  slug: 'quan-legging', parentId: 4, productCount: 6 },
];

/**
 * CategoriesPage — /admin/categories
 */
export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  /* ── Get parent name ── */
  const getParentName = (parentId) => {
    if (!parentId) return '—';
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : '—';
  };

  /* ── Only top-level categories can be parents ── */
  const parentOptions = categories.filter((c) => !c.parentId);

  /* ── Open modal ── */
  const openAddModal = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    form.setFieldsValue({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || undefined,
    });
    setModalOpen(true);
  };

  /* ── Auto-generate slug when name changes ── */
  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editing) {
      // Only auto-generate for new categories
      form.setFieldsValue({ slug: toSlug(name) });
    }
  };

  /* ── Save ── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        // PUT /api/categories/:id
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editing.id
              ? { ...c, name: values.name, slug: values.slug, parentId: values.parentId || null }
              : c
          )
        );
        message.success('Cập nhật danh mục thành công!');
      } else {
        // POST /api/categories
        const newCat = {
          id: Date.now(),
          name: values.name,
          slug: values.slug,
          parentId: values.parentId || null,
          productCount: 0,
        };
        setCategories((prev) => [...prev, newCat]);
        message.success('Thêm danh mục thành công!');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      /* validation errors shown inline */
    }
  };

  /* ── Delete ── */
  const handleDelete = (cat) => {
    if (cat.productCount > 0) {
      message.error(`Danh mục còn ${cat.productCount} sản phẩm, không thể xoá`);
      return;
    }
    // DELETE /api/categories/:id
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    message.success('Xoá danh mục thành công!');
  };

  /* ── Table columns ── */
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <span style={{ fontWeight: 600 }}>{name}</span>
          {record.parentId && (
            <span style={{ fontSize: 12, color: '#6e6e6e', marginLeft: 8 }}>
              ← {getParentName(record.parentId)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6e6e6e', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
          {slug}
        </span>
      ),
    },
    {
      title: 'Danh mục cha',
      key: 'parent',
      render: (_, record) => getParentName(record.parentId),
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 130,
      render: (count) => (
        <span style={{
          fontWeight: 600,
          color: count === 0 ? '#bdbdbd' : '#1b1b1b',
        }}>
          {count}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <div className="admin-products__actions">
          <button
            className="admin-products__action-btn"
            onClick={() => openEditModal(record)}
          >
            ✏️ Sửa
          </button>
          <Popconfirm
            title="Xác nhận xoá"
            description={
              record.productCount > 0
                ? `Danh mục còn ${record.productCount} sản phẩm, không thể xoá!`
                : `Bạn chắc chắn muốn xoá "${record.name}"?`
            }
            onConfirm={() => handleDelete(record)}
            okText={record.productCount > 0 ? 'Đã hiểu' : 'Xoá'}
            cancelText="Huỷ"
            okButtonProps={{
              danger: record.productCount === 0,
              disabled: record.productCount > 0,
            }}
          >
            <button className="admin-products__action-btn admin-products__action-btn--delete">
              🗑️ Xoá
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="admin-products__toolbar">
        <div className="admin-content__header" style={{ marginBottom: 0 }}>
          <h1 className="admin-content__title">Quản lý danh mục</h1>
          <p className="admin-content__subtitle">
            {categories.length} danh mục trong hệ thống
          </p>
        </div>
        <button className="admin-products__add-btn" onClick={openAddModal}>
          <PlusOutlined /> Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="admin-products__table-wrap" style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={editing ? 'Cập nhật' : 'Lưu'}
        cancelText="Huỷ"
        width={480}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="admin-modal-form"
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input
              placeholder="VD: Áo T-Shirt"
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Slug không được để trống' }]}
            extra="Tự động tạo từ tên, có thể chỉnh sửa tay"
          >
            <Input
              placeholder="ao-t-shirt"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Danh mục cha"
          >
            <Select
              placeholder="Không có (danh mục gốc)"
              allowClear
            >
              {parentOptions
                .filter((p) => !editing || p.id !== editing.id)
                .map((p) => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
