using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using RepositroryAndUnitOfWork.Interfaces;
using System.Data.Common;
using System.Data;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Core.Objects.DataClasses;
using System.Data.Entity;


namespace RepositroryAndUnitOfWork.Implementations
{
    public class UnitOfWork<C> : IUnitOfWork where C : DbContext
    {
        private DbTransaction _transaction;
        private Dictionary<Type, object> _repositories;
        private C _ctx;

        public UnitOfWork()
        {
            _ctx = Activator.CreateInstance<C>();
            _repositories = new Dictionary<Type, object>();
        }

        public IRepository<TSet> GetRepository<TSet>() where TSet : class
        {
            if (_repositories.Keys.Contains(typeof(TSet)))
                return _repositories[typeof(TSet)] as IRepository<TSet>;

            var repository = new Repository<TSet, C>(_ctx);
            _repositories.Add(typeof(TSet), repository);
            return repository;
        }
        /// <summary>
        /// Start Transaction
        /// </summary>
        /// <returns></returns>
        public DbTransaction BeginTransaction()
        {
            if (null == _transaction)
            {
                if (_ctx.Database.Connection.State != ConnectionState.Open)
                {
                    _ctx.Database.Connection.Open();
                }
                this._transaction = _ctx.Database.Connection.BeginTransaction();
            }
            return _transaction;
        }

        public int Save()
        {
            return _ctx.SaveChanges();
        }

        #region IDisposable Members

        public void Dispose()
        {
            if (null != _transaction)
            {
                _transaction.Dispose();
            }

            if (null != _ctx)
            {
                _ctx.Dispose();
            }
        }

        #endregion

    }
}
