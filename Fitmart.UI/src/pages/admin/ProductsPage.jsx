import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, Input, Select, Modal, Form,
  InputNumber, Upload, message, Popconfirm, Tag, Space,
} from 'antd';
import { PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

/* ─── Category options ─── */
const categoryOptions = [
  { value: 'ao-nam',     label: 'Áo Nam' },
  { value: 'quan-nam',   label: 'Quần Nam' },
  { value: 'ao-nu',      label: 'Áo Nữ' },
  { value: 'quan-nu',    label: 'Quần Nữ' },
  { value: 'phu-kien',   label: 'Phụ kiện' },
];

const statusOptions = [
  { value: 'active',      label: 'Đang bán' },
  { value: 'inactive',    label: 'Ngừng bán' },
  { value: 'outofstock',  label: 'Hết hàng' },
];

const colorOptions = [
  'Đen', 'Trắng', 'Xám', 'Xanh navy', 'Xanh rêu',
  'Đỏ', 'Nâu', 'Be', 'Hồng', 'Tím',
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/* ─── Mock products ─── */
const initialProducts = [
  {
    id: 1,
    name: 'Legacy Hoodie',
    category: 'ao-nam',
    price: 890000,
    salePrice: 690000,
    stock: 45,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Hoodie tập gym cao cấp, chất liệu cotton pha polyester',
    colors: ['Đen', 'Xám'],
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 2,
    name: 'Power Jogger',
    category: 'quan-nam',
    price: 750000,
    salePrice: null,
    stock: 32,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Quần jogger thể thao co giãn 4 chiều',
    colors: ['Đen', 'Xanh navy'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 3,
    name: 'Studio T-Shirt',
    category: 'ao-nam',
    price: 450000,
    salePrice: 350000,
    stock: 78,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Áo T-Shirt thoáng mát, thấm hút mồ hôi',
    colors: ['Trắng', 'Đen', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 4,
    name: 'Vital Legging Nữ',
    category: 'quan-nu',
    price: 680000,
    salePrice: null,
    stock: 0,
    status: 'outofstock',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Legging tập gym nữ ôm sát, co giãn tốt',
    colors: ['Đen', 'Hồng'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 5,
    name: 'GS Tank Top',
    category: 'ao-nam',
    price: 350000,
    salePrice: 280000,
    stock: 15,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Tank top thoáng khí, phù hợp tập nặng',
    colors: ['Đen', 'Trắng'],
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 6,
    name: 'Sports Bra Everyday',
    category: 'ao-nu',
    price: 520000,
    salePrice: null,
    stock: 60,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Áo bra thể thao nữ nâng đỡ tốt, mềm mại',
    colors: ['Đen', 'Hồng', 'Tím'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 7,
    name: 'Gym Duffel Bag',
    category: 'phu-kien',
    price: 950000,
    salePrice: 799000,
    stock: 22,
    status: 'active',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Túi gym duffel chống nước, nhiều ngăn',
    colors: ['Đen'],
    sizes: [],
  },
  {
    id: 8,
    name: 'Crop Top Vital',
    category: 'ao-nu',
    price: 420000,
    salePrice: null,
    stock: 3,
    status: 'inactive',
    image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
    description: 'Áo crop top nữ phong cách, thoáng mát',
    colors: ['Trắng', 'Be'],
    sizes: ['XS', 'S', 'M'],
  },
];

const statusCls = {
  active: 'admin-products__status--active',
  inactive: 'admin-products__status--inactive',
  outofstock: 'admin-products__status--outofstock',
};
const statusLabel = {
  active: 'Đang bán',
  inactive: 'Ngừng bán',
  outofstock: 'Hết hàng',
};

/**
 * ProductsPage — /admin/products
 */
export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  /* ─── Filtered data ─── */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  /* ─── Open modal ─── */
  const openAddModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      colors: product.colors,
      sizes: product.sizes,
      stock: product.stock,
      status: product.status,
    });
    setModalOpen(true);
  };

  /* ─── Save ─── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        // PUT /api/products/:id
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...values, image: p.image }
              : p
          )
        );
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // POST /api/products
        const newProduct = {
          ...values,
          id: Date.now(),
          image: 'https://res.cloudinary.com/dvbbfcxw4/image/upload/v1746733993/fitmart/nxkmz94zovr0lnzwv1rg.jpg',
          salePrice: values.salePrice || null,
          colors: values.colors || [],
          sizes: values.sizes || [],
        };
        setProducts((prev) => [newProduct, ...prev]);
        message.success('Thêm sản phẩm thành công!');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      /* validation errors shown inline */
    }
  };

  /* ─── Delete ─── */
  const handleDelete = (id) => {
    // DELETE /api/products/:id
    setProducts((prev) => prev.filter((p) => p.id !== id));
    message.success('Xoá sản phẩm thành công!');
  };

  /* ─── Table columns ─── */
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: (src) => (
        <img src={src} alt="" className="admin-products__img" />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="admin-products__name">{name}</span>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const found = categoryOptions.find((c) => c.value === cat);
        return found ? found.label : cat;
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v.toLocaleString('vi-VN')} ₫</div>
          {record.salePrice && (
            <div style={{ fontSize: 12, color: '#c62828' }}>
              Sale: {record.salePrice.toLocaleString('vi-VN')} ₫
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (v) => (
        <span style={{ fontWeight: 600, color: v === 0 ? '#c62828' : '#1b1b1b' }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <span className={`admin-products__status ${statusCls[s] || ''}`}>
          {statusLabel[s] || s}
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
            description={`Bạn chắc chắn muốn xoá "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <button className="admin-products__action-btn admin-products__action-btn--delete">
              🗑️ Xóa
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
          <h1 className="admin-content__title">Quản lý sản phẩm</h1>
          <p className="admin-content__subtitle">
            {products.length} sản phẩm trong hệ thống
          </p>
        </div>
        <button className="admin-products__add-btn" onClick={openAddModal}>
          <PlusOutlined /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="admin-products__filters">
        <Input
          placeholder="Tìm kiếm tên sản phẩm..."
          prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Danh mục"
          value={filterCategory}
          onChange={setFilterCategory}
          allowClear
          style={{ width: 180 }}
        >
          {categoryOptions.map((c) => (
            <Option key={c.value} value={c.value}>{c.label}</Option>
          ))}
        </Select>
        <Select
          placeholder="Trạng thái"
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 160 }}
        >
          {statusOptions.map((s) => (
            <Option key={s.value} value={s.value}>{s.label}</Option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="admin-products__table-wrap">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'}
        cancelText="Huỷ"
        width={640}
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
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Legacy Hoodie" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết sản phẩm..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="price"
              label="Giá (₫)"
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={10000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/,/g, '')}
                placeholder="890,000"
              />
            </Form.Item>

            <Form.Item name="salePrice" label="Giá sale (₫)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={10000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/,/g, '')}
                placeholder="690,000"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categoryOptions.map((c) => (
                  <Option key={c.value} value={c.value}>{c.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="stock"
              label="Tồn kho"
              rules={[{ required: true, message: 'Nhập số lượng' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="45" />
            </Form.Item>
          </div>

          <Form.Item name="colors" label="Màu sắc">
            <Select mode="multiple" placeholder="Chọn màu sắc">
              {colorOptions.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="sizes" label="Size">
            <Select mode="multiple" placeholder="Chọn size">
              {sizeOptions.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              {statusOptions.map((s) => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="image" label="Upload ảnh">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
