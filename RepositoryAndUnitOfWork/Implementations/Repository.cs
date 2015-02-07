using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using RepositroryAndUnitOfWork.Interfaces;
using System.Data;
using System.Data.Common;
using System.Reflection;
using System.Collections.ObjectModel;
using System.Linq.Expressions;
//using Jericho.DataAccess.Repository;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Core.Objects.DataClasses;
using System.Data.Entity.Core;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.Entity;
using DatabaseDataModel;

namespace RepositroryAndUnitOfWork.Implementations
{
    public class Repository<E, C> : IRepository<E>
        where E : class
        where C : DbContext
    {
        private readonly C _ctx;

        private DbSet<E> dbSet = null;


        public C Session
        {
            get { return _ctx; }
        }

        public Repository(C session)
        {
            _ctx = session;
            dbSet = _ctx.Set<E>();
        }

        #region IRepository<E,C> Members

        public int Save()
        {
            return _ctx.SaveChanges();
        }


        /// <summary>
        /// Returns the object with the primary key specifies or throws
        /// </summary>
        /// <typeparam name="TU">The type to map the result to</typeparam>
        /// <param name="primaryKey">The primary key</param>
        /// <returns>The result mapped to the specified type</returns>
        public E Single(object primaryKey)
        {
            var dbResult = dbSet.Find(primaryKey);
            return dbResult;
        }

        /// <summary>
        /// Returns the object with the primary key specifies or the default for the type
        /// </summary>
        /// <typeparam name="TU">The type to map the result to</typeparam>
        /// <param name="primaryKey">The primary key</param>
        /// <returns>The result mapped to the specified type</returns>
        public E SingleOrDefault(object primaryKey)
        {
            var dbResult = dbSet.Find(primaryKey);
            return dbResult;
        }

        public bool Exists(object primaryKey)
        {
            return dbSet.Find(primaryKey) == null ? false : true;
        }

        public virtual int Add(E entity)
        {
            dynamic obj = dbSet.Add(entity);
            return 1;
        }

        public virtual int AddCollection(IEnumerable<E> entity)
        {
            dynamic obj = dbSet.AddRange(entity);
            return 1;
        }

        public virtual void Update(E entity)
        {
            _ctx.Entry(entity).State = EntityState.Detached;
            dbSet.Attach(entity);
            _ctx.Entry(entity).State = EntityState.Modified;
        }
        public void Delete(E entity)
        {
            dbSet.Remove(entity);
        }

        public void DeleteCollection(IEnumerable<E> entity)
        {
            dbSet.RemoveRange(entity);
            _ctx.Entry(entity).State = EntityState.Detached;
        }
        public IEnumerable<E> GetAll()
        {
            return dbSet.AsEnumerable().ToList();
        }

        public IQueryable<E> GetData()
        {
            return dbSet.AsQueryable();
        }

        public IQueryable<E> GetData(Expression<Func<E, bool>> expression)
        {
            return dbSet.AsQueryable().Where(expression);
        }
        public IEnumerable<E> GetAll(Expression<Func<E, E>> selector)
        {
            return dbSet.Select(selector).AsQueryable().ToList();
        }
        public IEnumerable<E> GetAll(int pageNumber, int pageSize, out int totalRecords)
        {
            var query = dbSet.AsEnumerable();
            totalRecords = query.Count();
            return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
        }
        public IEnumerable<E> GetAll(Expression<Func<E, object>> orderby, bool isAsc)
        {
            if (isAsc)
                return dbSet.AsQueryable().OrderBy(orderby).ToList();
            else
                return dbSet.AsQueryable().OrderByDescending(orderby).ToList();
        }
        public IEnumerable<E> GetAll(Expression<Func<E, int>> orderby, bool isAsc)
        {
            if (isAsc)
                return dbSet.AsQueryable().OrderBy(orderby).ToList();
            else
                return dbSet.AsQueryable().OrderByDescending(orderby).ToList();
        }

        public IEnumerable<E> GetAll(Expression<Func<E, object>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords)
        {
            if (isAsc)
            {
                var query = dbSet.AsQueryable().OrderBy(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
            else
            {
                var query = dbSet.AsQueryable().OrderByDescending(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
        }
        public IEnumerable<E> GetAll(Expression<Func<E, int>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords)
        {
            if (isAsc)
            {
                var query = dbSet.AsQueryable().OrderBy(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
            else
            {
                var query = dbSet.AsQueryable().OrderByDescending(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
        }

        public IEnumerable<E> GetAll(Expression<Func<E, bool>> expression)
        {
            return dbSet.AsNoTracking().AsQueryable().Where(expression).ToList();
        }

        public IEnumerable<E> GetAll1(Expression<Func<E, bool>> expression)
        {
            return dbSet.Where(expression).ToList();
        }

        public IEnumerable<E> GetAll(Func<E, bool> expression)
        {
            return dbSet.AsQueryable().Where(expression).ToList();
        }
        public IEnumerable<E> GetAll(Expression<Func<E, bool>> expression, int pageNumber, int pageSize, out int totalRecords)
        {
            var query = dbSet.AsQueryable().Where(expression);
            totalRecords = query.Count();
            return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
        }

        public IEnumerable<E> GetAll(Expression<Func<E, bool>> expression, Expression<Func<E, object>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords)
        {
            if (isAsc)
            {
                var query = dbSet.AsQueryable().Where(expression).OrderBy(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
            else
            {
                var query = dbSet.AsQueryable().Where(expression).OrderByDescending(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
        }
        public IEnumerable<E> GetAll(Expression<Func<E, bool>> expression, Expression<Func<E, int>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords)
        {
            if (isAsc)
            {
                var query = dbSet.AsQueryable().Where(expression).OrderBy(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
            else
            {
                var query = dbSet.AsQueryable().Where(expression).OrderByDescending(orderby);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
        }


        public IEnumerable<E> GetAll(Func<E, bool> expression, Func<E, E> select,  bool isAsc, int pageNumber, int pageSize, out int totalRecords)
        {
            if (isAsc)
            {
                var query = dbSet.Select(select).Where(expression);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
            else
            {
                var query = dbSet.Select(select).Where(expression);
                totalRecords = query.Count();
                return query.Skip(pageNumber * pageSize).Take(pageSize).ToList();
            }
        }

        public IEnumerable<E> GetAll(Func<E, bool> expression, Func<E, E> select)
        {
            return dbSet.Select(select).Where(expression);
        }

        public Nullable<double> GetSum(Expression<Func<E, bool>> expression, Expression<Func<E, Nullable<double>>> selector)
        {
            return dbSet.AsQueryable().Where(expression).Sum(selector);
        }

        public void ExecWithStoreProcedure(string query, params object[] parameters)
        {
            _ctx.Database.SqlQuery<E>(query, parameters);
        }
        #endregion
    }
}
