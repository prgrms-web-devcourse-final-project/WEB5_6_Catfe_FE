import Button from "../Button"
import RoomPassword from "./RoomPassword"

function SettingsSecurity() {
  return (
    <div>
      <RoomPassword className="mb-4"/>
      <hr className=" border-text-secondary/70 mb-3 "/>
      <Button
        type="submit"
        size="sm"
        borderType="solid"
        color="primary"
        className="text-[10px]"
      >
      스터디룸 삭제
      </Button>
    </div>
  )
}
export default SettingsSecurity