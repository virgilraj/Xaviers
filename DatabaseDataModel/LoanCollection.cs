//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DatabaseDataModel
{
    using System;
    using System.Collections.Generic;
    
    public partial class LoanCollection
    {
        public int Id { get; set; }
        public int LoanId { get; set; }
        public Nullable<int> CustomerId { get; set; }
        public Nullable<int> ContactId { get; set; }
        public string ContactName { get; set; }
        public Nullable<double> Amount { get; set; }
        public Nullable<double> Interest { get; set; }
        public Nullable<double> LateFee { get; set; }
        public string Description { get; set; }
        public Nullable<bool> IsApprove { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
        public Nullable<int> ReceiverId { get; set; }
        public string ReceiverName { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public Nullable<int> ModifyBy { get; set; }
        public Nullable<System.DateTime> ModifyDate { get; set; }
    }
}
