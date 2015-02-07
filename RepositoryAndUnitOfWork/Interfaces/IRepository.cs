using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity.Core.Objects;
using System.Data.Common;
using System.Collections.ObjectModel;
using System.Linq.Expressions;

namespace RepositroryAndUnitOfWork.Interfaces
{
    public interface IRepository<T>
    {
        /// <summary>
        /// Retrieve a single item using it's primary key, exception if not found
        /// </summary>
        /// <param name="primaryKey">The primary key of the record</param>
        /// <returns>T</returns>
        T Single(object primaryKey);
        
        /// <summary>
        /// Retrieve a single item by it's primary key or return null if not found
        /// </summary>
        /// <param name="primaryKey">Prmary key to find</param>
        /// <returns>T</returns>
        T SingleOrDefault(object primaryKey);

        /// <summary>
        /// Returns all the rows for type T
        /// </summary>
        /// <returns></returns>
        IEnumerable<T> GetAll();
        IQueryable<T> GetData();
        IQueryable<T> GetData(Expression<Func<T, bool>> expression);
        IEnumerable<T> GetAll(Expression<Func<T, T>> selector);
        IEnumerable<T> GetAll(int pageNumber, int pageSize, out int totalRecords);
        IEnumerable<T> GetAll(Expression<Func<T, object>> orderby, bool isAsc);
        IEnumerable<T> GetAll(Expression<Func<T, int>> orderby, bool isAsc);

        IEnumerable<T> GetAll(Expression<Func<T, object>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords);
        IEnumerable<T> GetAll(Expression<Func<T, int>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords);
        
        IEnumerable<T> GetAll(Expression<Func<T, bool>> expression);
        IEnumerable<T> GetAll(Func<T, bool> expression);
        IEnumerable<T> GetAll(Expression<Func<T, bool>> expression, int pageNumber, int pageSize, out int totalRecords);

        IEnumerable<T> GetAll(Expression<Func<T, bool>> expression,Expression<Func<T, object>> orderby,bool isAsc, int pageNumber, int pageSize, out int totalRecords);
        IEnumerable<T> GetAll(Expression<Func<T, bool>> expression, Expression<Func<T, int>> orderby, bool isAsc, int pageNumber, int pageSize, out int totalRecords);

        IEnumerable<T> GetAll(Func<T, bool> expression, Func<T, T> select, bool isAsc, int pageNumber, int pageSize, out int totalRecords);
        IEnumerable<T> GetAll(Func<T, bool> expression, Func<T, T> select);

        Nullable<double> GetSum(Expression<Func<T, bool>> expression, Expression<Func<T, Nullable<double>>> selector);
        
        /// <summary>
        /// Does this item exist by it's primary key
        /// </summary>
        /// <param name="primaryKey"></param>
        /// <returns></returns>
        bool Exists(object primaryKey);

        /// <summary>
        /// Inserts the data into the table
        /// </summary>
        /// <param name="entity">The entity to insert</param>
        /// <param name="userId">The user performing the insert</param>
        /// <returns></returns>
        int Add(T entity);
        int AddCollection(IEnumerable<T> entity);

        /// <summary>
        /// Updates this entity in the database using it's primary key
        /// </summary>
        /// <param name="entity">The entity to update</param>
        /// <param name="userId">The user performing the update</param>
        void Update(T entity);



        /// <summary>
        /// Deletes this entry fro the database
        /// ** WARNING - Most items should be marked inactive and Updated, not deleted
        /// </summary>
        /// <param name="entity">The entity to delete</param>
        /// <param name="userId">The user Id who deleted the entity</param>
        /// <returns></returns>
        void Delete(T entity);
        void DeleteCollection(IEnumerable<T> entity);

        void ExecWithStoreProcedure(string query, params object[] parameters);
    }
}
