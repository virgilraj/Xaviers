using System;
using System.Data.Common;

namespace RepositroryAndUnitOfWork.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<TSet> GetRepository<TSet>() where TSet : class;
        DbTransaction BeginTransaction();
        int Save();

       // int UpdateContactName(Nullable<int> contactId, Nullable<int> customerId, string contactName);
    }
}
