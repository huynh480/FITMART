import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Modal, Form, Select, message, Popconfirm, Spin, Alert, Tag } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { categoriesApi } from '../../services/api';

const { Option } = Select;

/* ─── Slug helper ─── */
function toSlug(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ─── Hiển thị Gender tag ─── */
const GENDER_TAG = {
  nam:    { color: 'blue',   label: 'Nam' },
  nu:     { color: 'pink',   label: 'Nữ' },
  unisex: { color: 'green',  label: 'Unisex' },
};

/* ─── Group order ─── */
const GROUP_ORDER = ['nam', 'nu', 'unisex', null];
const GROUP_LABEL = { nam: '👔 NAM', nu: '👗 NỮ', unisex: '🎽 PHỤ KIỆN', null: '—' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [genderFilter, setGenderFilter] = useState(null); // null = tất cả
  const [form] = Form.useForm();

  /* ── Fetch ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data ?? []);
    } catch (e) {
      setError(`Không thể tải danh mục: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Filter theo gender ── */
  const filtered = useMemo(() =>
    genderFilter ? categories.filter(c => c.gender === genderFilter) : categories,
    [categories, genderFilter]
  );

  /* ── Modal helpers ── */
  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    form.setFieldsValue({
      name:        cat.name,
      slug:        cat.slug ?? toSlug(cat.name),
      gender:      cat.gender ?? 'unisex',
      description: cat.description ?? '',
    });
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

      const payload = {
        id:          editing?.id ?? 0,
        name:        values.name.trim(),
        slug:        (values.slug || toSlug(values.name)).trim(),
        gender:      values.gender ?? null,
        description: values.description?.trim() ?? '',
      };

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
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (cat) => {
    try {
      await categoriesApi.remove(cat.id);
      message.success(`Đã xoá danh mục "${cat.name}"!`);
      await fetchCategories();
    } catch (e) {
      message.error(`Xoá thất bại: ${e.message}`);
    }
  };

  /* ── Columns ── */
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (n) => <span style={{ fontWeight: 600 }}>{n}</span>,
    },
    {
      title: 'Slug',
      key: 'slug',
      render: (_, r) => (
        <span style={{
          fontFamily: 'monospace', fontSize: 12,
          color: '#6e6e6e', background: '#f5f5f5',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {r.slug || toSlug(r.name)}
        </span>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 110,
      render: (g) => {
        const cfg = GENDER_TAG[g] ?? { color: 'default', label: g ?? '—' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (d) => d || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_, rec) => (
        <div className="admin-products__actions">
          <button className="admin-products__action-btn" onClick={() => openEdit(rec)}>✏️ Sửa</button>
          <Popconfirm
            title="Xác nhận xoá"
            description={`Xoá danh mục "${rec.name}"?`}
            onConfirm={() => handleDelete(rec)}
            okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}
          >
            <button className="admin-products__action-btn admin-products__action-btn--delete">🗑️ Xoá</button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ── Group header renderer ── */
  const renderGroupedTable = () => {
    const groups = {};
    filtered.forEach(cat => {
      const key = cat.gender ?? 'null';
      if (!groups[key]) groups[key] = [];
      groups[key].push(cat);
    });

    return GROUP_ORDER.map(g => {
      const key = g ?? 'null';
      const rows = groups[key];
      if (!rows?.length) return null;
      return (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{
            fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
            color: '#555', padding: '8px 0 6px',
            borderBottom: '2px solid #f0f0f0', marginBottom: 8,
          }}>
            {GROUP_LABEL[g ?? 'null'] ?? '—'} &nbsp;
            <span style={{ fontWeight: 400, color: '#999', fontSize: 12 }}>
              ({rows.length} danh mục)
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={rows}
            rowKey="id"
            pagination={false}
            size="small"
            showHeader={g === 'nam'} // chỉ hiện header ở nhóm đầu
          />
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="admin-products__toolbar">
        <div className="admin-content__header" style={{ marginBottom: 0 }}>
          <h1 className="admin-content__title">Quản lý danh mục</h1>
          <p className="admin-content__subtitle">{categories.length} danh mục trong hệ thống</p>
        </div>
        <button className="admin-products__add-btn" onClick={openAdd}>
          <PlusOutlined /> Thêm danh mục
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }}
          closable onClose={() => setError(null)} />
      )}

      {/* ── Filter by gender ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 4 }}>
        {[null, 'nam', 'nu', 'unisex'].map(g => (
          <button
            key={g ?? 'all'}
            onClick={() => setGenderFilter(g)}
            style={{
              padding: '4px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
              border: '1px solid',
              borderColor: genderFilter === g ? '#1b1b1b' : '#d9d9d9',
              background: genderFilter === g ? '#1b1b1b' : '#fff',
              color: genderFilter === g ? '#fff' : '#555',
              fontWeight: genderFilter === g ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {g === null ? 'Tất cả' : GENDER_TAG[g]?.label}
          </button>
        ))}
      </div>

      {/* ── Grouped tables ── */}
      <div className="admin-products__table-wrap" style={{ marginTop: 8 }}>
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          {renderGroupedTable()}
        </Spin>
      </div>

      {/* ── Modal Thêm / Sửa ── */}
      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={closeModal}
        okText={editing ? 'Cập nhật' : 'Lưu'}
        cancelText="Huỷ"
        confirmLoading={saving}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="VD: Áo T-Shirt Nam" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item name="slug" label="Slug (URL)"
            tooltip="Tự generate từ tên. Dùng a-z, 0-9 và dấu gạch ngang."
            rules={[
              { required: true, message: 'Vui lòng nhập slug' },
              { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Chỉ gồm chữ thường, số và dấu -' },
            ]}>
            <Input
              placeholder="vd: ao-t-shirt"
              prefix={<span style={{ color: '#bbb', fontSize: 12 }}>/collections/</span>}
            />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính"
            rules={[{ required: true, message: 'Chọn giới tính' }]}>
            <Select placeholder="Chọn giới tính">
              <Option value="nam">👔 Nam</Option>
              <Option value="nu">👗 Nữ</Option>
              <Option value="unisex">🎽 Unisex / Phụ kiện</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả hiển thị ở CollectionHero…" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
