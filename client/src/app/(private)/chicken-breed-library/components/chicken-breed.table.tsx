'use client';
import { DataTable } from '@/components/customs/data-table/data-table.component';
import { useChickenBreedTableLogic } from './chicken-library.table.logic';

export default function ChickenBreedTable() {
  const {
    columns,
    fetchData,
    handleSetRefreshFn,
    handleNewAddRecord,
    handleCopy,
    cardComponent,
    checkboxActions,
    renderFormModal,
  } = useChickenBreedTableLogic();

  return (
    <div className="container mx-auto py-8">
      <DataTable
        columns={columns}
        fetchData={fetchData}
        enableServerSide
        enableSearch
        enableColumnVisibility
        enableRowSelection={false}
        enablePagination
        enableSorting
        enableRefreshButton
        searchPlaceholder="Search Record..."
        title="Chicken Breed Library Management"
        description="Manage and monitor all Chicken Breed Records"
        onAddNew={handleNewAddRecord}
        // enableFilters={true} // Enable filters
        // filterOptions={filterOptions} // Pass filter options
        addButtonText="Add Record"
        refreshButtonText="Refresh"
        emptyStateMessage="No Records's found."
        pageSizeOptions={[5, 10, 25, 50, 100]}
        checkboxActions={checkboxActions}
        initialLoadDelay={1000}
        fetchLoadDelay={500}
        className="max-w-full"
        onRefresh={handleSetRefreshFn}
        enableCard={true}
        cardComponent={cardComponent}
        enableUrlSync={true}
        storageKey="asset_records"
        enableViewToggle={true}
        defaultViewType="row"
      />

      {renderFormModal()}
      {/* {renderAssetDetailsDrawer()} */}
      {/* {renderAuditLogsViewer()} */}
    </div>
  );
}
