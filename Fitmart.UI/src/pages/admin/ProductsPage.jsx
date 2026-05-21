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

/* ─── Các tuỳ chọn tĩnh ─── */
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

/* ─── Style helpers cho các section trong form ─── */
const sec  = { background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '16px 16px 4px', marginBottom: 16 };
const secT = { fontSize: 13, fontWeight: 700, color: '#1b1b1b', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #ebebeb' };

/* ═══════════════════════════════════════════════════
   ProductsPage — Quản lý sản phẩm (Admin)
   Hỗ trợ upload 1 ảnh chính + nhiều ảnh chi tiết
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

  // State cho ảnh chính (1 file)
  const [fileList, setFileList]             = useState([]);
  // State cho ảnh chi tiết (nhiều file)
  const [detailFileList, setDetailFileList] = useState([]);
  // State cho kích cỡ được chọn (Size)
  const [selectedSizes, setSelectedSizes] = useState([]);

  const [form] = Form.useForm();

  /* ─── Lấy dữ liệu từ API ─── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll();
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

  /* ─── Lọc sản phẩm (client-side) ─── */
  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch   = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.categoryId === filterCategory;
    const matchStatus   = !filterStatus   || p.status     === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  }), [products, search, filterCategory, filterStatus]);

  /* ─── Mở modal thêm mới ─── */
  const openAdd = () => {
    setEditingProduct(null);
    setFileList([]);
    setDetailFileList([]);
    setSelectedSizes([]);
    form.resetFields();
    setModalOpen(true);
  };

  /* ─── Mở modal chỉnh sửa ─── */
  const openEdit = (p) => {
    setEditingProduct(p);

    // Load ảnh chính từ variant đầu tiên
    const src = p.productVariants?.[0]?.imageUrl;
    if (src) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: src.startsWith('http') ? src : `${API_BASE}${src}`,
        }
      ]);
    } else {
      setFileList([]);
    }

    // Load ảnh chi tiết hiện có từ productImages
    if (p.productImages && p.productImages.length > 0) {
      setDetailFileList(
        p.productImages.map((img, index) => ({
          uid: `detail-${img.id || index}`,
          name: `detail-${index + 1}.jpg`,
          status: 'done',
          url: img.imageUrl?.startsWith('http')
            ? img.imageUrl
            : `${API_BASE}${img.imageUrl}`,
        }))
      );
    } else {
      setDetailFileList([]);
    }

    // Load danh sách size từ các variant hiện có
    const currentSizes = p.productVariants
      ? [...new Set(p.productVariants.map(v => v.size))].filter(Boolean)
      : [];
    setSelectedSizes(currentSizes);

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

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSizes([]);
    form.resetFields();
  };

  /* ─── Lưu sản phẩm (Thêm mới / Cập nhật) ─── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Tạo FormData để gửi multipart/form-data
      const formData = new FormData();
      formData.append('id', editingProduct?.id ?? 0);
      formData.append('name', values.name);
      formData.append('description', values.description ?? '');
      formData.append('price', values.price);
      formData.append('gender', values.gender ?? '');
      formData.append('collection', values.collection ?? '');
      formData.append('isFeatured', values.isFeatured ?? false);
      formData.append('categoryId', values.categoryId);
      formData.append('status', values.status ?? 'active');

      // Gắn danh sách kích cỡ (Sizes)
      if (selectedSizes && selectedSizes.length > 0) {
        formData.append('Sizes', selectedSizes.join(','));
      } else {
        formData.append('Sizes', '');
      }

      // Gắn file ảnh chính (nếu có file mới từ máy tính)
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      // Gắn danh sách file ảnh chi tiết (chỉ các file mới từ máy tính)
      const newDetailFiles = detailFileList.filter(f => f.originFileObj);
      if (newDetailFiles.length > 0) {
        newDetailFiles.forEach(f => {
          formData.append('DetailImageFiles', f.originFileObj);
        });
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await productsApi.create(formData);
        message.success('Thêm sản phẩm thành công!');
      }

      closeModal();
      await fetchProducts();
    } catch (e) {
      if (e?.errorFields) return; // Lỗi validate của AntD — hiển thị inline
      message.error(`Lỗi: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Xoá sản phẩm ─── */
  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);
      message.success('Xoá sản phẩm thành công!');
      await fetchProducts();
    } catch (e) {
      message.error(`Xoá thất bại: ${e.message}`);
    }
  };

  /* ─── Cột bảng ─── */
  const columns = [
    { title: 'Ảnh', dataIndex: 'productVariants', key: 'img', width: 72,
      render: (variants) => {
        const src = variants?.[0]?.imageUrl;
        const finalSrc = src ? (src.startsWith('http') ? src : `${API_BASE}${src}`) : null;
        return finalSrc ? <img src={finalSrc} alt="" className="admin-products__img" /> : <div className="admin-products__img" style={{ background: '#f0f0f0' }} />;
      } },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name',
      render: (n) => <span className="admin-products__name">{n}</span> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category',
      render: (cat) => cat?.name ?? '—' },
    { title: 'Giá', dataIndex: 'price', key: 'price',
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toLocaleString('vi-VN')} ₫</span> },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender',
      render: (g) => g ?? '—', width: 90 },
    // Cột số ảnh chi tiết
    { title: 'Ảnh chi tiết', dataIndex: 'productImages', key: 'detailImgs', width: 100,
      render: (imgs) => <span style={{ color: '#6e6e6e' }}>{imgs?.length ?? 0} ảnh</span> },
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

      {/* ── Bộ lọc ── */}
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

      {/* ── Bảng sản phẩm ── */}
      <div className="admin-products__table-wrap">
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          <Table columns={columns} dataSource={filtered} rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }} size="middle" />
        </Spin>
      </div>

      {/* ── Modal Thêm/Sửa sản phẩm ── */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen} onOk={handleSave} onCancel={closeModal}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'} cancelText="Huỷ"
        confirmLoading={saving} width={720} destroyOnClose
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">

          {/* ── Thông tin cơ bản ── */}
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

          {/* ── Giá & Danh mục ── */}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="status" label="Trạng thái hiển thị">
                <Select placeholder="Chọn trạng thái" defaultValue="active">
                  {statusOptions.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Kích cỡ (Size)">
                <Select
                  mode="multiple"
                  placeholder="Chọn kích cỡ (S, M, L...)"
                  value={selectedSizes}
                  onChange={setSelectedSizes}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {sizeOptions.map(sz => (
                    <Option key={sz} value={sz}>{sz}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* ── Ảnh chính (tối đa 1 ảnh) ── */}
          <div style={sec}><div style={secT}>🖼️ Ảnh đại diện chính (tối đa 1 ảnh)</div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}  /* Tắt tự động upload — chờ submit */
              onChange={({ fileList: newFileList }) => {
                setFileList(newFileList.slice(-1)); /* Chỉ giữ 1 ảnh */
              }}
              onRemove={() => setFileList([])}
            >
              {fileList.length < 1 && (
                <div style={{ textAlign: 'center' }}>
                  <PlusOutlined style={{ fontSize: 18, display: 'block', marginBottom: 4 }} />
                  <div>Thêm ảnh</div>
                </div>
              )}
            </Upload>
          </div>

          {/* ── Ảnh chi tiết (cho phép nhiều ảnh) ── */}
          <div style={sec}><div style={secT}>📸 Ảnh chi tiết sản phẩm (nhiều ảnh)</div>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
              Chọn nhiều file cùng lúc để upload. Ảnh sẽ được hiển thị trong trang chi tiết sản phẩm.
            </p>
            <Upload
              listType="picture-card"
              fileList={detailFileList}
              multiple                     /* Cho phép chọn nhiều file cùng lúc */
              beforeUpload={() => false}   /* Tắt tự động upload — chờ submit */
              onChange={({ fileList: newList }) => {
                setDetailFileList(newList);
              }}
              onRemove={(file) => {
                setDetailFileList(prev => prev.filter(f => f.uid !== file.uid));
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <PlusOutlined style={{ fontSize: 18, display: 'block', marginBottom: 4 }} />
                <div>Thêm ảnh</div>
              </div>
            </Upload>
          </div>

        </Form>
      </Modal>
    </>
  );
}
