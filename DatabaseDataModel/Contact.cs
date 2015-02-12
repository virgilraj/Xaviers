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
    
    public partial class Contact
    {
        public Contact()
        {
            this.Qualifications = new HashSet<Qualification>();
            this.Users = new HashSet<User>();
            this.WorkExperiences = new HashSet<WorkExperience>();
        }
    
        public int ContactId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string PinCode { get; set; }
        public string ComAddress1 { get; set; }
        public string ComAddress { get; set; }
        public string ComCity { get; set; }
        public string ComState { get; set; }
        public string ComCountry { get; set; }
        public string ComPinCode { get; set; }
        public string PhoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public string Email { get; set; }
        public string Qualification { get; set; }
        public string Gender { get; set; }
        public Nullable<int> SpouseId { get; set; }
        public string SpouseName { get; set; }
        public string Occupation { get; set; }
        public Nullable<bool> HasImage { get; set; }
        public Nullable<int> YearIncome { get; set; }
        public Nullable<System.DateTime> DOB { get; set; }
        public Nullable<System.DateTime> DOD { get; set; }
        public Nullable<System.DateTime> BaptismDate { get; set; }
        public Nullable<System.DateTime> Eucharist { get; set; }
        public Nullable<System.DateTime> Reconciliation { get; set; }
        public Nullable<System.DateTime> Confirmation { get; set; }
        public Nullable<System.DateTime> Marriage { get; set; }
        public Nullable<System.DateTime> HolyOrders { get; set; }
        public Nullable<System.DateTime> AnointingoftheSick { get; set; }
        public Nullable<int> FatherId { get; set; }
        public string FatherName { get; set; }
        public Nullable<int> MotherId { get; set; }
        public string MotherName { get; set; }
        public Nullable<int> GuardianId { get; set; }
        public string GuardianName { get; set; }
        public Nullable<bool> IsMember { get; set; }
        public Nullable<bool> IsEligibleForTax { get; set; }
        public Nullable<int> CustomerId { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public Nullable<int> ModifyBy { get; set; }
        public Nullable<System.DateTime> ModifyDate { get; set; }
        public Nullable<System.DateTime> DOL { get; set; }
        public Nullable<int> GroupId { get; set; }
        public string GroupName { get; set; }
        public bool IsNameChanged { get; set; }
        public int OldGrpId { get; set; }
    
        public virtual ICollection<Qualification> Qualifications { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<WorkExperience> WorkExperiences { get; set; }
    }
}
