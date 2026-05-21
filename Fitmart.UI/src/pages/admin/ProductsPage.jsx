import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Table, Input, Select, Modal, Form, InputNumber,
  Upload, message, Popconfirm, Spin, Alert,
} from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { productsApi, categoriesApi } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5049';

const { Option } = Select;
const { TextArea } = Input;

/* ─── Static options ─── */
const statusOptions = [
  { value: 'active',     label: 'Đang bán' },
  { value: 'inactive',   label: 'Ngừng bán' },
  { value: 'outofstock', label: 'Hết hàng' },
];
const colorOptions = ['Đen','Trắng','Xám','Xanh navy','Xanh rêu','Đỏ','Nâu','Be','Hồng','Tím'];
const sizeOptions  = ['XS','S','M','L','XL','XXL'];
const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ',  label: 'Nữ' },
  { value: 'Unisex', label: 'Unisex' },
];


const statusCls   = { active: 'admin-products__status--active', inactive: 'admin-products__status--inactive', outofstock: 'admin-products__status--outofstock' };
const statusLabel = { active: 'Đang bán', inactive: 'Ngừng bán', outofstock: 'Hết hàng' };

/* ─── Image uploader per color group ───
 * - preview[] chứa imageUrl từ server (ví dụ: "/images/products/abc.jpg")
 * - Khi chọn file: gọi productsApi.uploadImage() → nhận url → hiển thị preview ngay
 */
function ImageUploaderByColor({ colorList, value, onChange }) {
  const groups   = colorList?.length > 0 ? ['Chung', ...colorList] : ['Chung'];
  const groupData = value || {};
  const getGroup  = (g) => groupData[g] || { urls: [] };

  const removeImage = (group, idx) => {
    const gd = getGroup(group);
    onChange({ ...groupData, [group]: { urls: gd.urls.filter((_, i) => i !== idx) } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map((group) => {
        const gd = getGroup(group);
        return (
          <div key={group}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
              {group === 'Chung' ? '📷 Ảnh chung (thumb = ảnh đầu)' : `🎨 Màu: ${group}`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gd.urls.map((url, idx) => (
                <div key={idx} style={{
                  position: 'relative', width: 86, height: 86,
                  borderRadius: 6, overflow: 'hidden',
                  border: idx === 0 ? '2px solid #1b1b1b' : '1px solid #e0e0e0',
                }}>
                  <img
                    src={url.startsWith('http') ? url : `${API_BASE}${url}`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {idx === 0 && (
                    <span style={{
                      position: 'absolute', top: 3, left: 3,
                      background: '#1b1b1b', color: '#fff',
                      fontSize: 9, padding: '1px 5px', borderRadius: 4,
                    }}>THUMB</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(group, idx)}
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      background: 'rgba(0,0,0,.55)', border: 'none',
                      borderRadius: '50%', width: 18, height: 18,
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                  >
                    <DeleteOutlined style={{ color: '#fff', fontSize: 10 }} />
                  </button>
                </div>
              ))}

              {gd.urls.length < 6 && (
                <Upload
                  listType="picture-card"
                  fileList={[]}
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={async (file) => {
                    if (!file.type.startsWith('image/')) {
                      message.error('Chỉ chấp nhận file ảnh!');
                      return Upload.LIST_IGNORE;
                    }
                    const hide = message.loading('Đang upload ảnh...', 0);
                    try {
                      const { imageUrl } = await productsApi.uploadImage(file);
                      onChange({
                        ...groupData,
                        [group]: { urls: [...gd.urls, imageUrl] },
                      });
                      message.success('Upload ảnh thành công!');
                    } catch (e) {
                      message.error(`Upload thất bại: ${e.message}`);
                    } finally {
                      hide();
                    }
                    return false; // ngăn antd tự gửi
                  }}
                >
                  <div style={{ fontSize: 12, textAlign: 'center', color: '#999' }}>
                    <PlusOutlined style={{ fontSize: 18, display: 'block', marginBottom: 4 }} />
                    Thêm ảnh
                    <div style={{ fontSize: 10 }}>{gd.urls.length}/6</div>
                  </div>
                </Upload>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Section style helpers ─── */
const sec  = { background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '16px 16px 4px', marginBottom: 16 };
const secT = { fontSize: 13, fontWeight: 700, color: '#1b1b1b', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #ebebeb' };

/* ═══════════════════════════════════════════════════
   ProductsPage
   ═══════════════════════════════════════════════════ */
export default function ProductsPage() {
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState(null);
  const [search, setSearch]                 = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus]     = useState(null);
  const [modalOpen, setModalOpen]           = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [colorImages, setColorImages]       = useState({});
  const [selectedColors, setSelectedColors] = useState([]);
  const [form] = Form.useForm();

  /* ─── Fetch ─── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll();
      // API trả về { items: [...] }
      setProducts(data?.items ?? data ?? []);
    } catch (e) {
      setError(`Không thể tải danh sách sản phẩm: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data ?? []);
    } catch {/* non-critical, ignore */ }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  /* ─── Filter (client-side) ─── */
  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch   = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.categoryId === filterCategory;
    const matchStatus   = !filterStatus   || p.status     === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  }), [products, search, filterCategory, filterStatus]);

  /* ─── Open modals ─── */
  const openAdd = () => {
    setEditingProduct(null);
    setColorImages({});
    setSelectedColors([]);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setSelectedColors([]);
    // Lấy tất cả imageUrl từ productVariants, loại trùng, đưa vào nhóm "Chung"
    const allUrls = [...new Set(
      (p.productVariants || []).map(v => v.imageUrl).filter(Boolean)
    )];
    setColorImages(allUrls.length > 0 ? { Chung: { urls: allUrls } } : {});
    form.setFieldsValue({
      name:              p.name,
      description:       p.description,
      price:             p.price,
      gender:            p.gender,
      collection:        p.collection,
      isFeatured:        p.isFeatured,
      categoryId:        p.categoryId,
      status:            p.status ?? 'active',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); form.resetFields(); };

  /* ─── Save ─── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Lấy thumbnail: url đầu tiên từ nhóm Chung, nếu không có lấy từ nhóm bất kỳ
      const thumb =
        colorImages?.Chung?.urls?.[0] ||
        Object.values(colorImages).find(g => g.urls?.[0])?.urls?.[0] ||
        null;

      const payload = {
        id:          editingProduct?.id ?? 0,
        name:        values.name,
        description: values.description ?? '',
        price:       values.price,
        gender:      values.gender ?? null,
        collection:  values.collection ?? null,
        isFeatured:  values.isFeatured ?? false,
        categoryId:  values.categoryId,
        // productVariants dùng riêng — không gửi trong payload này
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await productsApi.create(payload);
        message.success('Thêm sản phẩm thành công!');
      }

      closeModal();
      await fetchProducts();
    } catch (e) {
      if (e?.errorFields) return; // AntD validation error — shown inline
      message.error(`Lỗi: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);
      message.success('Xoá sản phẩm thành công!');
      await fetchProducts();
    } catch (e) {
      message.error(`Xoá thất bại: ${e.message}`);
    }
  };

  /* ─── Table columns ─── */
  const columns = [
    { title: 'Ảnh', dataIndex: 'productVariants', key: 'img', width: 72,
      render: (variants) => {
        const src = variants?.[0]?.imageUrl;
        return src ? <img src={src} alt="" className="admin-products__img" /> : <div className="admin-products__img" style={{ background: '#f0f0f0' }} />;
      } },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name',
      render: (n) => <span className="admin-products__name">{n}</span> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category',
      render: (cat) => cat?.name ?? '—' },
    { title: 'Giá', dataIndex: 'price', key: 'price',
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toLocaleString('vi-VN')} ₫</span> },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender',
      render: (g) => g ?? '—', width: 90 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <span className={`admin-products__status ${statusCls[s] || ''}`}>{statusLabel[s] || 'Đang bán'}</span> },
    { title: 'Hành động', key: 'actions', width: 180,
      render: (_, rec) => (
        <div className="admin-products__actions">
          <button className="admin-products__action-btn" onClick={() => openEdit(rec)}>✏️ Sửa</button>
          <Popconfirm title="Xác nhận xoá" description={`Xoá "${rec.name}"?`}
            onConfirm={() => handleDelete(rec.id)}
            okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}>
            <button className="admin-products__action-btn admin-products__action-btn--delete">🗑️ Xóa</button>
          </Popconfirm>
        </div>
      ) },
  ];

  return (
    <>
      {/* ── Header ── */}
      <div className="admin-products__toolbar">
        <div className="admin-content__header" style={{ marginBottom: 0 }}>
          <h1 className="admin-content__title">Quản lý sản phẩm</h1>
          <p className="admin-content__subtitle">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <button className="admin-products__add-btn" onClick={openAdd}>
          <PlusOutlined /> Thêm sản phẩm
        </button>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}

      {/* ── Filters ── */}
      <div className="admin-products__filters">
        <Input placeholder="Tìm kiếm tên sản phẩm..." prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
        <Select placeholder="Danh mục" value={filterCategory} onChange={setFilterCategory} allowClear style={{ width: 180 }}>
          {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
        </Select>
        <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus} allowClear style={{ width: 160 }}>
          {statusOptions.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
        </Select>
      </div>

      {/* ── Table ── */}
      <div className="admin-products__table-wrap">
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          <Table columns={columns} dataSource={filtered} rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }} size="middle" />
        </Spin>
      </div>

      {/* ── Modal ── */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen} onOk={handleSave} onCancel={closeModal}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'} cancelText="Huỷ"
        confirmLoading={saving} width={720} destroyOnClose
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">

          {/* Thông tin cơ bản */}
          <div style={sec}><div style={secT}>📋 Thông tin cơ bản</div>
            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input placeholder="VD: Legacy Hoodie" />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} placeholder="Mô tả chi tiết sản phẩm…" />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính" allowClear>
                  {genderOptions.map(g => <Option key={g.value} value={g.value}>{g.label}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="collection" label="Bộ sưu tập">
                <Input placeholder="VD: Summer 2026" />
              </Form.Item>
            </div>
            <Form.Item name="isFeatured" label="Nổi bật (Featured)">
              <Select>
                <Option value={false}>Không nổi bật</Option>
                <Option value={true}>Nổi bật trên trang chủ</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Giá & Danh mục */}
          <div style={sec}><div style={secT}>💰 Giá & Danh mục</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="price" label="Giá (₫)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={10000}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/,/g, '')} placeholder="890,000" />
              </Form.Item>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                <Select
                  placeholder="Chọn danh mục"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, opt) =>
                    (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id} label={cat.name}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="status" label="Trạng thái hiển thị">
              <Select placeholder="Chọn trạng thái" defaultValue="active">
                {statusOptions.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
              </Select>
            </Form.Item>
          </div>

          {/* Ảnh sản phẩm */}
          <div style={sec}><div style={secT}>🖼️ Ảnh sản phẩm (tối đa 6 ảnh/nhóm — ảnh đầu = thumbnail)</div>
            <ImageUploaderByColor
              colorList={selectedColors}
              value={colorImages}
              onChange={setColorImages}
            />
          </div>

        </Form>
      </Modal>
    </>
  );
}
