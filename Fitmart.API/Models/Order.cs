using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitmart.API.Models;

public class Order
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = "";

    [Required]
    [MaxLength(50)]
    public string Phone { get; set; } = "";

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = "";

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "cod";

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Required]
    public string Status { get; set; } = "Pending";
}