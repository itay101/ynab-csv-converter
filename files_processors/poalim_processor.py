from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawCSVFile
from files_processors.raw_files import YnabCsvFields


class PoalimProcessor(RawCSVFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._header_mapping = [
            HeaderMapItem(source="\ufeffתאריך", target=YnabCsvFields.DATE.value),
            HeaderMapItem(source="תיאור הפעולה", target=YnabCsvFields.PAYEE.value),
            HeaderMapItem(source="אסמכתא", target=YnabCsvFields.MEMO.value),
            HeaderMapItem(source="חובה", target=YnabCsvFields.OUTFLOW.value),
            HeaderMapItem(source="זכות", target=YnabCsvFields.INFLOW.value),
        ]