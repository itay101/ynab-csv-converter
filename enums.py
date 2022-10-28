import enum

from files_processors.isracard_processor import IsracardProcessor
from files_processors.max_processor import MaxProcessor
from files_processors.poalim_processor import PoalimProcessor


class AccountTypes(enum.Enum):
    POALIM = "poalim"
    ISRACARD = "isracard"
    MAX = "max"


class AccountTypeToProcessor:
    def __init__(self):
        self._account_type_to_processor = {
            AccountTypes.POALIM.value: PoalimProcessor,
            AccountTypes.ISRACARD.value: IsracardProcessor,
            AccountTypes.MAX.value: MaxProcessor,
        }

    def get_processor_by_type(self, account_type):
        return self._account_type_to_processor.get(account_type)

    def get_processors(self):
        return self._account_type_to_processor.values()
